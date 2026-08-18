# CampusOS — MongoDB-only setup

This version uses MongoDB/Mongoose for:
- Users/authentication
- Students
- Teachers
- Attendance

MySQL/mysql2 has been removed from the backend.

## Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Put your MongoDB connection string in `MONGO_URI`.
3. Open a terminal:

```bat
cd backend
npm install
npm start
```

The API runs on `http://localhost:5000`.

## Frontend

In a second terminal:

```bat
cd frontend\frontend
npm install
npm run dev
```

## Optional seed users

From `backend`:

```bat
node seeduser.js
```

Do not commit `backend/.env`.
