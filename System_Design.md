# ApnaHome — System Design Write-up

---

## Overview

ApnaHome is a room rental and flatmate matching platform built around four core
systems: an AI compatibility engine, a real-time chat system, an email notification
pipeline, and a role-based REST API. This document covers the design decisions behind
each of these systems.

---

## 1. Compatibility Scoring Design

The core value proposition of ApnaHome is intelligent matching — not just filtering
by price and location, but understanding how well a tenant and a listing align.

When a tenant browses listings, the system computes a compatibility score (0–100)
for each tenant-listing pair. The score is computed once and stored permanently in
the `matches` table using a composite unique constraint on `(tenant_id, listing_id)`.
On every subsequent request for the same pair, the score is read directly from the
database — the LLM is never called again. This design choice eliminates redundant API
calls, reduces latency, and keeps costs at zero for repeat views.

The `matches` table stores:
- `score` — integer 0 to 100
- `explanation` — one sentence from the LLM describing why the match is strong or weak
- `is_fallback` — boolean flag distinguishing LLM scores from rule-based scores

Listings are returned to the tenant sorted by score descending, so the best matches
always appear at the top.

---

## 2. LLM Integration and Fallback

### Primary — Groq LLM

The system uses the Groq API with the `llama3-8b-8192` model for compatibility
scoring. The prompt is structured to give the model both the listing details and the
tenant's preferences in a clear format, and asks it to return only a JSON object with
a numeric score and a one-sentence explanation.

```
Prompt structure:
  Given this room listing: [location, rent, room_type, furnishing, available_from]
  And this tenant profile: [preferred_location, budget_min, budget_max, move_in_date]
  Return JSON: { "score": number, "explanation": string }
```

The model temperature is set to 0.3 to keep responses consistent and focused. The
response is parsed as JSON and validated before being stored. If the response is
malformed or missing required fields, it is treated as a failure and the fallback
kicks in.

### Fallback — Rule-Based Scoring

If the Groq API is unavailable, times out, returns an error, or returns an
unparseable response, the system automatically falls back to a deterministic
rule-based scorer:

```
Budget within tenant range  → +50 points
Location string match       → +50 points
```

The fallback returns the same JSON shape as the LLM response
`{ score, explanation, is_fallback: true }` so the rest of the system behaves
identically regardless of which path ran. The `is_fallback` flag is stored in the
database so the frontend can optionally show an "estimated" label on the score badge.

This graceful degradation ensures the platform remains fully functional even when the
LLM service is down, which directly satisfies the assignment requirement of handling
LLM failures without breaking the user experience.

---

## 3. Real-Time Chat Implementation

Chat is implemented using a dedicated Socket.io server running on a separate port
from the REST API. This separation allows the two servers to scale independently and
keeps the codebase clean.

### Authentication

Every socket connection is authenticated before any event is processed. The client
passes the JWT token in the socket handshake auth object. The server verifies the
token using the same `JWT_SECRET` as the REST API before allowing the connection to
proceed. Unauthenticated connections are rejected immediately.

### Room Design

Each accepted interest maps to exactly one chat room. The room name is
`chat_{interest_id}`, making it globally unique and directly tied to the relationship
between a specific tenant and a specific listing owner. Both parties join the same
room after the owner accepts the interest request.

### Message Flow

```
Client emits send_message { interestId, content }
     ↓
Server saves message to messages table in Supabase
     ↓
Server emits new_message to all sockets in chat_{interestId}
     ↓
Both clients receive and render the message in real time
```

### Message Persistence

Every message is written to the `messages` table in the database before being
broadcast. When either party opens the chat page, the REST API endpoint
`GET /api/chat/:interestId` loads the full message history ordered by `created_at`
ascending. The socket then handles only new messages from that point forward. This
means chat history survives page refreshes, reconnections, and browser restarts.

### Access Control

The chat REST endpoint and the socket server both enforce that only the tenant and
the owner of the matched listing can access a given chat room. The interest status
must be `accepted` — pending or declined interests cannot access chat.

---

## 4. Notification Flow

Email notifications are handled by the Resend service and are triggered at two
specific points in the interest lifecycle.

### Trigger 1 — High Score Interest (Owner Notification)

When a tenant sends an interest request, the system checks the `matches` table for
the compatibility score. If the score is above 80, an email is immediately sent to
the listing owner informing them that a high-compatibility tenant has expressed
interest. The threshold of 80 is chosen to filter signal from noise — only genuinely
strong matches notify the owner, preventing inbox fatigue.

### Trigger 2 — Interest Decision (Tenant Notification)

When an owner accepts or declines an interest, an email is sent to the tenant
informing them of the decision. If accepted, the email directs them to open the chat.
If declined, it encourages them to keep browsing.

### Fire-and-Forget Design

Email sends are intentionally fire-and-forget — they are never awaited in the main
response flow. Each email call is wrapped in `.catch()` so that an email failure
never causes the API response to fail. The main business logic (creating the interest
or updating its status) always completes successfully regardless of email delivery.

```
POST /api/interests
  → create interest record  ← always happens
  → check score > 80
  → send email.catch(log)   ← failure here never affects the response
  → return 201 to client
```

This design keeps the API fast and resilient. Email delivery is best-effort, which
is appropriate for a notification system at this scale.

---

## Database Design Summary

The schema is normalized around six tables with foreign key relationships enforcing
data integrity. The key design decisions are:

- `unique(tenant_id, listing_id)` on `matches` — enforces the no-recompute rule at
  the database level, not just application level
- `status` enum on `interests` — single source of truth for where a tenant-owner
  relationship stands
- `messages` linked to `interests` not to users directly — chat is scoped to an
  accepted relationship, not a general user-to-user inbox
- `is_filled` on `listings` — soft delete pattern that hides filled rooms from search
  without deleting the data

---

## Deployment Architecture

```
Vercel          → React frontend (static)
Render (port 3000) → Express REST API
Render (port 3001) → Socket.io server
Supabase        → PostgreSQL database (managed)
```

The REST API and Socket server are deployed as two separate Render services from the
same repository using different root directories. This mirrors the local development
setup and makes the deployment straightforward to reason about.

---

