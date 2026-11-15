# 🏢 SmartNest – AI-Based Apartment Management System

SmartNest is a fully functional, end-to-end, multi-role apartment community and facility operations management platform.

---

## 🚀 Key Highlights & Architecture

- **Real Database:** Persistent MongoDB via Mongoose. All users, complaints, and visitor requests persist across restarts.
- **Real Authentication & Authorization:**
  - Password hashing with **bcrypt** (12 salt rounds, never stored or returned in plaintext).
  - Stateles **JWT** authentication with 7-day expiration.
  - Server-side role authorization guards (`resident`, `visitor`, `maintenance`).
  - Frontend protected routes with automatic role-based redirecting.
- **Three Fully Functional Portals:**
  - **Resident:** Submit complaints, track real-time resolution status, review and approve/reject visitor access requests.
  - **Visitor:** Submit visit requests for specific apartments, track resident approval status in real-time.
  - **Maintenance Staff:** Oversee all facility complaints, filter by status and category, update ticket progression, and attach resolution notes for residents.
- **Automatic Complaint Categorization:**
  - Rules-based keyword classification engine instantly detects category: `Plumbing`, `Electrical`, `Cleaning`, or `General`.
- **Rock-Solid Security:**
  - Strict Cross-Origin Resource Sharing (CORS) configuration.
  - Sensitive passwords stripped at model serialization (`toJSON`).
  - Cross-apartment authorization controls: residents can only approve requests targeting their own unit.
  - Express-validator on incoming payloads.

---

## 🛠 Tech Stack

- **Backend:** Node.js (v20+), Express.js, MongoDB, Mongoose, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `express-validator`, `cors`, `dotenv`
- **Frontend:** React 18, Vite 5, TailwindCSS 3, React Router DOM (v6), Axios, `react-hot-toast`

---

## 📋 System Requirements

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** v6.0 or higher (running locally on port 27017 or a MongoDB Atlas connection string)

---

## ⚡ Quick Start Guide

### 1. Clone & Navigate to Project

```bash
cd smartnest
```

### 2. Configure Backend

Navigate to the `backend` folder:
```bash
cd backend
npm install
```

Ensure `.env` exists (copied from `.env.example`):
```env
MONGODB_URI=mongodb://localhost:27017/smartnest
JWT_SECRET=smartnest_super_secret_jwt_key_2024_change_in_production
PORT=5001
FRONTEND_URL=http://localhost:5173
```
*(Note: Port 5001 is used by default to prevent conflicts with macOS AirPlay Receiver on port 5000).*

### 3. Seed Maintenance Staff Account

Run the database seed script to initialize the pre-authorized maintenance staff account:
```bash
npm run seed
```

**Default Maintenance Credentials:**
- **Email:** `maintenance@smartnest.com`
- **Password:** `Maintenance@123`

### 4. Start the Backend Server

```bash
npm start
# Server will run on: http://localhost:5001
```

### 5. Configure & Start Frontend

In a new terminal window, navigate to `frontend`:
```bash
cd smartnest/frontend
npm install
```

Ensure `.env` exists:
```env
VITE_API_URL=http://localhost:5001/api
```

Start the Vite development server:
```bash
npm run dev
# Frontend will run on: http://localhost:5173
```

To test the optimized production build:
```bash
npm run build
npm run preview
```

---

## 🧪 Verified Workflow Testing

The following automated end-to-end integration workflows are verified and passing:

| Code | Workflow | Verification Status |
|:---:|:---|:---:|
| **A** | Resident registration & login | ✅ Verified (JWT issued, passwords stripped) |
| **B** | Visitor registration & login | ✅ Verified (JWT issued, passwords stripped) |
| **C** | Maintenance staff login | ✅ Verified (pre-seeded credentials) |
| **D** | Resident submits complaint | ✅ Verified (title & description validated) |
| **E** | Complaint saved in MongoDB | ✅ Verified (Mongoose model persistence) |
| **F** | Complaint receives correct category | ✅ Verified (`Plumbing`, `Electrical`, etc.) |
| **G** | Maintenance staff views all complaints | ✅ Verified (filter by status & category) |
| **H** | Maintenance updates complaint status & note | ✅ Verified (saved & timestamped) |
| **I** | Resident sees updated status in real-time | ✅ Verified (resolution notes displayed) |
| **J** | Visitor submits apartment visit request | ✅ Verified (linked to resident apartment) |
| **K** | Resident approves or rejects request | ✅ Verified (ownership enforced) |
| **L** | Visitor sees updated approval status | ✅ Verified (approval badge & callout) |
| **M** | Unauthorized access blocked | ✅ Verified (401/403 on private & cross-role endpoints) |

---

## 🛡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` – Register new `resident` or `visitor` account.
- `POST /login` – Sign in and retrieve JWT token.

### Complaints (`/api/complaints`)
- `POST /` – Submit new complaint (Resident only).
- `GET /` – Fetch complaints (Residents see own; Maintenance sees all with `?status=` and `?category=` filters).
- `PATCH /:id/status` – Update complaint status and attach resolution note (Maintenance only).

### Visitor Requests (`/api/visitors`)
- `POST /` – Submit visit permission request for apartment (Visitor only).
- `GET /` – Fetch requests (Visitors see own requests; Residents see requests for their unit).
- `PATCH /:id/status` – Approve or Reject request (Resident only).
