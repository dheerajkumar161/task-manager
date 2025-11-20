# Task Manager RBAC

A simple Task Manager application with role-based access control (RBAC).  
Backend: Node/Express + MongoDB. Frontend: Vite + React + TypeScript.


## Setup

Prerequisites
- Node.js (14+)
- npm
- MongoDB connection string

Backend
```sh
# backend
cd backend && cd backend
npm install
npm run dev
```

Frontend
```sh
# frontend
cd ../frontend
npm install
npm run dev
```

Open the frontend dev URL printed by Vite (usually http://localhost:5173). Backend runs on the port defined in `backend/.env` (default 5000).

## Environment

Example backend `.env` (see `backend/.env`)
```
PORT=5000
MONGO_URI=<your-mongo-uri>
DB_NAME=task_manager_rbac
JWT_SECRET=<your-jwt-secret>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@123
```

Frontend can be pointed at the API via Vite env (if present) or the default API base in `frontend/src/services/api.ts` (defaults to http://localhost:5000/api).

## API Endpoints

Base path: /api

| Method | Endpoint                  | Auth required | Notes |
|--------|---------------------------|---------------|-------|
| POST   | /api/auth/register        | No            | Register new user |
| POST   | /api/auth/login           | No            | Login, returns JWT |
| GET    | /api/users                | Yes (admin)   | List users (admin only) |
| GET    | /api/users/:id            | Yes           | Get user by id |
| GET    | /api/tasks                | Yes           | List tasks (user/admin sees permitted tasks) |
| POST   | /api/tasks                | Yes           | Create task |
| GET    | /api/tasks/:id            | Yes           | Get task by id |
| PUT    | /api/tasks/:id            | Yes           | Update task |
| DELETE | /api/tasks/:id            | Yes (owner/admin) | Delete task |

Adjust endpoints if your local code differs.

## Notes

- Ensure `MONGO_URI` and `JWT_SECRET` are set correctly in `backend/.env`.
- If frontend cannot reach the API, confirm backend is running and the API base URL in `frontend/src/services/api.ts`.
- Note: First registered user can manually be made admin in DB:
UPDATE users SET role = 'admin' WHERE id = 1;

## Troubleshooting

- Mongo connection errors: verify `MONGO_URI` and network access.
- JWT errors: confirm `JWT_SECRET` matches between environment and any tokens.
- Ports: ensure backend port (default 5000) is free.
