# 🏠 ApnaHome — Rent & Flatmate Finder

A full-stack platform where **owners list spare rooms** and **tenants find compatible flatmates** using an AI-powered compatibility engine. Real-time chat unlocks once interest is accepted, and email notifications keep both parties informed at every step.

---

## 📸 Screenshots

<!-- Add screenshots here after UI is built -->
<img width="1470" height="834" alt="Screenshot 2026-07-03 at 12 43 22 PM" src="https://github.com/user-attachments/assets/3d0081ce-50c5-423b-946c-e6a0ed47e7b8" />

<img width="1470" height="834" alt="Screenshot 2026-07-03 at 12 43 37 PM" src="https://github.com/user-attachments/assets/b40c3f5e-25f6-443e-9497-cea08d81741b" />

<img width="1470" height="835" alt="Screenshot 2026-07-03 at 12 43 49 PM" src="https://github.com/user-attachments/assets/eea67e80-c39a-4422-a053-99684a181b94" />

<img width="1470" height="835" alt="Screenshot 2026-07-03 at 12 43 56 PM" src="https://github.com/user-attachments/assets/754d5611-f029-40a3-b8a9-2368c6cd24a3" />


<!-- ![Landing Page](./docs/screenshots/landing.png) -->
<!-- ![Listings Page](./docs/screenshots/listings.png) -->
<!-- ![Chat](./docs/screenshots/chat.png) -->

---

## ✨ Features

- 🔐 Dual auth — manual email/password + Google OAuth via Firebase
- 🤖 AI compatibility scoring (Groq LLM) with rule-based fallback
- 💬 Real-time chat via Socket.io (unlocks after interest accepted)
- 📧 Email notifications via Resend on key events
- 🏷️ Role-based access — Owner / Tenant
- 📦 Score cached in DB — never recomputed for same tenant+listing pair

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Auth | Firebase Admin + JWT + bcryptjs |
| AI Scoring | Groq API (llama3-8b-8192) |
| Fallback | Rule-based scoring |
| Real-time | Socket.io |
| Email | Resend |
| Frontend | React + Vite |
| Hosting | Render (API + Socket) + Vercel (Client) |

---

## 📁 Project Structure

```
ApnaHome/
├── api/              # Express REST API
│   ├── config/       # Supabase + Firebase setup
│   ├── controllers/  # Route handlers
│   ├── middleware/   # JWT + role verification
│   ├── routes/       # API route definitions
│   ├── services/     # AI scoring + email logic
│   └── app.js
├── socket/           # Socket.io server
│   └── index.js
├── client/           # React + Vite frontend
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- Supabase account (free)
- Firebase project (free)
- Groq API key (free at console.groq.com)
- Resend account (free at resend.com)

---

### 1. Clone the repo

```bash
git clone https://github.com/Jeevesh2605/ApnaHome.git
cd ApnaHome
```

---

### 2. Setup Supabase Database

- Go to [supabase.com](https://supabase.com) and create a new project
- Open the **SQL Editor** and run the full schema below:

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text,
  role text check (role in ('owner', 'tenant')) not null,
  auth_provider text default 'manual',
  firebase_uid text unique,
  created_at timestamp default now()
);

create table listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id) on delete cascade,
  location text not null,
  rent numeric not null,
  available_from date not null,
  room_type text not null,
  furnishing text not null,
  description text,
  is_filled boolean default false,
  created_at timestamp default now()
);

create table tenant_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references users(id) on delete cascade unique,
  preferred_location text not null,
  budget_min numeric not null,
  budget_max numeric not null,
  move_in_date date not null,
  created_at timestamp default now()
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references users(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  score integer not null,
  explanation text not null,
  is_fallback boolean default false,
  created_at timestamp default now(),
  unique(tenant_id, listing_id)
);

create table interests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references users(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_at timestamp default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  interest_id uuid references interests(id) on delete cascade,
  sender_id uuid references users(id) on delete cascade,
  content text not null,
  created_at timestamp default now()
);
```

---

### 3. Setup Firebase

- Go to [Firebase Console](https://console.firebase.google.com)
- Create a new project → Enable **Google Sign-In** under Authentication
- Go to **Project Settings → Service Accounts → Generate new private key**
- Copy `projectId`, `clientEmail`, `privateKey` into your `.env`

---

### 4. Configure Environment Variables

```bash
cd api
cp .env.example .env
# Fill in all values in .env
```

---

### 5. Install dependencies and run

```bash
# Terminal 1 — API server
cd api
npm install
npm run dev

# Terminal 2 — Socket server
cd socket
npm install
npm run dev

# Terminal 3 — Frontend
cd client
npm install
npm run dev
```

API runs on `http://localhost:3000`
Socket runs on `http://localhost:3001`
Frontend runs on `http://localhost:5173`

---

## 🌐 Hosted URL

| Service | URL |
|---|---|
| API | `https://apnahome-api.onrender.com` |
| Socket | `https://apnahome-socket.onrender.com` |
| Frontend | `https://apnahome-nu.vercel.app` |

> ⚠️ Render free tier spins down after 15 mins inactivity — first request may take ~30 seconds

---

## 📡 API Documentation

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Manual register with name, email, password, role |
| POST | `/api/auth/login` | Public | Manual login |
| POST | `/api/auth/google` | Public | Google login via Firebase idToken |

### Listings

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/listings` | Any | Browse listings — filter by `location`, `min_rent`, `max_rent` |
| GET | `/api/listings/mine` | Owner | Get owner's own listings |
| GET | `/api/listings/:id` | Any | Get single listing |
| POST | `/api/listings` | Owner | Create new listing |
| PUT | `/api/listings/:id` | Owner | Update listing |
| PATCH | `/api/listings/:id/fill` | Owner | Mark listing as filled |
| DELETE | `/api/listings/:id` | Owner | Delete listing |

### Tenant Profile

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/tenant/profile` | Tenant | Create or update profile |
| GET | `/api/tenant/profile` | Tenant | Get own profile |

### AI Compatibility Matches

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/matches/:listingId` | Tenant | Get or compute AI score for a listing |
| GET | `/api/matches` | Tenant | Get all scored listings sorted by score |

### Interests

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/interests` | Tenant | Send interest for a listing |
| PATCH | `/api/interests/:id` | Owner | Accept or decline interest |
| GET | `/api/interests/incoming` | Owner | View all incoming interests |
| GET | `/api/interests/sent` | Tenant | View all sent interests |

### Chat

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/chat/:interestId` | Any | Load chat history (requires accepted interest) |

---

## 🔌 Socket Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join_room` | Client → Server | `interestId` | Join chat room |
| `send_message` | Client → Server | `{ interestId, content }` | Send a message |
| `new_message` | Server → Client | message object | Broadcast to room |
| `error` | Server → Client | `{ message }` | Error feedback |

**Socket auth:** Pass JWT token in handshake — `socket.handshake.auth.token`

---

## 🤖 LLM Compatibility Scoring

### Prompt Used

```
Given this room listing:
- Location: {listing.location}
- Rent: Rs.{listing.rent}/month
- Room type: {listing.room_type}
- Furnishing: {listing.furnishing}
- Available from: {listing.available_from}

And this tenant profile:
- Preferred location: {profile.preferred_location}
- Budget: Rs.{profile.budget_min} to Rs.{profile.budget_max}/month
- Move-in date: {profile.move_in_date}

Compute a compatibility score from 0 to 100 based on how well this listing
matches the tenant. Return ONLY valid JSON, no extra text:
{ "score": <number 0-100>, "explanation": "<one sentence max>" }
```

### Example Input

```json
Listing: {
  "location": "Indiranagar, Bangalore",
  "rent": 12000,
  "room_type": "single",
  "furnishing": "furnished",
  "available_from": "2024-08-01"
}

Tenant Profile: {
  "preferred_location": "Indiranagar",
  "budget_min": 10000,
  "budget_max": 14000,
  "move_in_date": "2024-08-05"
}
```

### Example Output

```json
{
  "score": 91,
  "explanation": "Location is an exact match and rent falls well within the tenant's budget range."
}
```

### Fallback Logic (when LLM fails)

```
Budget within range  → +50 points
Location match       → +50 points
Total                → 0 / 50 / 100
```

`is_fallback: true` is stored in DB to distinguish fallback scores from LLM scores.

---

## 📧 Email Notifications

| Trigger | Recipient | Condition |
|---|---|---|
| Tenant sends interest | Owner | Only if compatibility score > 80 |
| Owner accepts interest | Tenant | Always |
| Owner declines interest | Tenant | Always |

---

## 🗄️ DB Schema Overview

```
users            → id, name, email, password, role, auth_provider, firebase_uid
listings         → id, owner_id, location, rent, available_from, room_type, furnishing, is_filled
tenant_profiles  → id, tenant_id, preferred_location, budget_min, budget_max, move_in_date
matches          → id, tenant_id, listing_id, score, explanation, is_fallback  [unique: tenant+listing]
interests        → id, tenant_id, listing_id, status (pending/accepted/declined)
messages         → id, interest_id, sender_id, content, created_at
```

---

## 🔑 Google Auth Flow

```
1. Frontend → Firebase signInWithPopup()
2. Firebase → returns idToken
3. Frontend → POST /api/auth/google { idToken, role }
4. Backend → verifies idToken with Firebase Admin SDK
5. Backend → creates/finds user in Supabase
6. Backend → issues own JWT
7. All subsequent API calls use this JWT only
```

## Backup Google Drive Link

```
[Google Drive Link](https://drive.google.com/drive/folders/1GJxRHbMSrsxx7vV0KQ6vQHkHTPrlInsQ?usp=share_link)
```
---
```
This Readme.md is written with the help of AI
```

