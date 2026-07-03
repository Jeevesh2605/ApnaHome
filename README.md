# Rent & Flatmate Finder Backend

This is the backend implementation of the Rent & Flatmate Finder application.
It includes an Express REST API for core functionality and a separate Socket.io server for real-time chat.

## Tech Stack
- **Node.js & Express**: API framework.
- **Supabase**: PostgreSQL database and ORM.
- **Firebase Admin**: Authentication via Google login.
- **Groq API**: LLM for calculating tenant-listing compatibility scores.
- **Resend**: Email notifications.
- **Socket.io**: Real-time chat.

## Directory Structure
- `/api`: The main Express application.
- `/socket`: The Socket.io server.
- `/client`: (Empty directory for the future frontend implementation).

## Setup
1. Run `npm install` in both `/api` and `/socket`.
2. Configure your environment variables in `/api/.env`.
3. Run the Supabase SQL from the prompt in your Supabase project's SQL Editor.
4. Start both servers:
   - `cd api && node app.js` (Runs on port 3000)
   - `cd socket && node index.js` (Runs on port 3001)
