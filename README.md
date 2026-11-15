# 🏢 SmartNest – AI-Based Apartment Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-SmartNest%20Frontend-blue?style=for-the-badge&logo=render)](https://smartnest-frontend-4to4.onrender.com)
[![Live API](https://img.shields.io/badge/Live%20API-Backend%20Service-green?style=for-the-badge&logo=render)](https://smartnest-backend-b0as.onrender.com/api)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://cloud.mongodb.com/)

SmartNest is a fully functional, end-to-end, multi-role apartment community and facility operations management platform.

---

## 🌐 Live Production Deployments

- **🖥️ Web Application:** **[https://smartnest-frontend-4to4.onrender.com](https://smartnest-frontend-4to4.onrender.com)**
- **⚙️ Backend REST API:** **[https://smartnest-backend-b0as.onrender.com/api](https://smartnest-backend-b0as.onrender.com/api)**
- **🗄️ Database:** Live MongoDB Atlas Cloud Cluster

### 🔑 Pre-Seeded Maintenance Credentials
You can immediately sign into the live application with:
- **Email:** `maintenance@smartnest.com`
- **Password:** `Maintenance@123`

*(Residents and visitors can register directly on the live `/register` page).*

---

## 🚀 Key Highlights & Architecture

- **Real Database:** Persistent MongoDB via Mongoose. Connected to MongoDB Atlas Cloud Cluster. All users, complaints, and visitor requests persist across restarts.
- **Real Authentication & Authorization:**
  - Password hashing with **bcrypt** (12 salt rounds, never stored or returned in plaintext).
  - Stateless **JWT** authentication with 7-day expiration.
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
  - Express-validator on all incoming payloads.
- **Automated Deployment:**
  - Render Blueprint (`render.yaml`) for 1-click CI/CD deployment of both backend and frontend.

---

## 🛠 Tech Stack

- **Backend:** Node.js (v20+), Express.js, MongoDB Atlas, Mongoose, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `express-validator`, `cors`, `dotenv`
- **Frontend:** React 18, Vite 5, TailwindCSS 3, React Router DOM (v6), Axios, `react-hot-toast`
- **Hosting / CI-CD:** Render (Web Service + Static Site), Render Blueprint Automation

---

## 📋 System Requirements

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** MongoDB Atlas cloud cluster (or local MongoDB v6.0+)

---

## ⚡ Quick Start Guide (Local Development)

### 1. Clone the Project

```bash
git clone https://github.com/rajnandini1905/smartnest.git
cd smartnest
```

### 2. Configure & Start Backend

```bash
cd smartnest/backend
npm install
cp .env.example .env
# Edit .env to set your MONGODB_URI and JWT_SECRET
npm run seed     # Seeds maintenance staff account
npm start        # Runs on http://localhost:5001
```

### 3. Configure & Start Frontend

In a separate terminal:
```bash
cd smartnest/frontend
npm install
cp .env.example .env
npm run dev      # Runs on http://localhost:5173
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
- `POST /` – Submit new complaint (Resident only, auto-categorized).
- `GET /` – Fetch complaints (Residents see own; Maintenance sees all with `?status=` and `?category=` filters).
- `PATCH /:id/status` – Update complaint status and attach resolution note (Maintenance only).

### Visitor Requests (`/api/visitors`)
- `POST /` – Submit visit permission request for apartment (Visitor only).
- `GET /` – Fetch requests (Visitors see own requests; Residents see requests for their unit).
- `PATCH /:id/status` – Approve or Reject request (Resident only).
