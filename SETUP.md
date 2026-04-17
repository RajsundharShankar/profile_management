# Profile Management (MERN) — Setup

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string

## 1. Backend (`server/`)

```powershell
cd server
copy .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET (long random string), CLIENT_URL, PORT
npm install
npm run dev
```

Server defaults to `http://localhost:5000`. It exposes:

- `POST /auth/register`, `POST /auth/login`
- `GET /users/:id`, `PUT /users/:id` (JWT + own user only)
- `POST /users/upload-avatar` (form field `avatar`, multipart)
- `PUT /users/change-password`
- Static files under `/uploads`

## 2. Frontend (`client/`)

```powershell
cd client
copy .env.example .env
# Optional: set VITE_API_URL if not using the dev proxy
npm install
npm run dev
```

With the default Vite config, leave `VITE_API_URL` empty in development so requests go through the proxy to port 5000.

## 3. Environment variables

**server `.env`**

| Variable       | Example |
|----------------|---------|
| `PORT`         | `5000` |
| `MONGODB_URI`  | `mongodb://127.0.0.1:27017/profile_management` |
| `JWT_SECRET`   | Long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL`   | `http://localhost:5173` |

**client `.env`**

| Variable        | Notes |
|-----------------|-------|
| `VITE_API_URL`  | Empty in dev (proxy). In production, full API origin (e.g. `https://api.example.com`). |

## 4. Postman quick tests

1. **Register** — `POST {{base}}/auth/register` — JSON body: `{ "name": "Test", "email": "test@example.com", "password": "password1" }`
2. **Login** — `POST {{base}}/auth/login` — JSON: `{ "email": "test@example.com", "password": "password1" }` — copy `token` from response.
3. **Get profile** — `GET {{base}}/users/{{userId}}` — Header: `Authorization: Bearer <token>`
4. **Update profile** — `PUT {{base}}/users/{{userId}}` — JSON: `{ "name": "New", "bio": "Hello" }`
5. **Change password** — `PUT {{base}}/users/change-password` — JSON: `{ "currentPassword": "password1", "newPassword": "password2" }`
6. **Upload avatar** — `POST {{base}}/users/upload-avatar` — Body: form-data, key `avatar` (file)

Set `base` to `http://localhost:5000`.
