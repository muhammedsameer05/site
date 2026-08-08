# Installation & Setup Guide

This guide details how to install, configure, and run the **Madrasa Milad Management System** on your local environment or production server.

---

## 📋 Prerequisites

- **Node.js**: v18.0 or higher (v24 tested)
- **npm**: v9.0 or higher
- **MySQL Database** (Optional for production; SQLite auto-seeds locally out-of-the-box).

---

## 🚀 Quick Start (Local Development)

### 1. Install Backend & Start Server
```bash
cd backend
npm install
npm run dev
```
*The backend API server starts at `http://localhost:5000` and initializes the auto-seeded SQLite database.*

### 2. Install Frontend & Start Development App
```bash
cd frontend
npm install
npm run dev
```
*The React frontend will start at `http://localhost:3000`.*

---

## 🗄️ MySQL Database Setup (Production Mode)

1. Open your MySQL server terminal or phpMyAdmin.
2. Execute `backend/database/schema.sql` to create `madrasa_milad_db` and all 17 tables.
3. Execute `backend/database/seed.sql` to populate initial test data.
4. Set environment variables in `backend/.env`:
```env
PORT=5000
JWT_SECRET=madrasa_milad_secret_key_2026
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=madrasa_milad_db
```

---

## 🔑 Demo Account Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `password123` |
| **Admin** | `admin` | `password123` |
| **Judge** | `judge1` | `password123` |
| **Stage Coordinator** | `coordinator1` | `password123` |

*Note: You can also use the Role Switcher dropdown in the top Navbar to test any role instantly.*
