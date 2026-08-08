# Madrasa Milad Management System

A full-stack, enterprise-grade web application built for Madrasa Milad-un-Nabi Festivals featuring a modern Islamic aesthetic (Emerald Green, Gold & White theme), real-time WebSockets live scoring, automated house point calculations, digital PDF certificate generation, Excel export engine, QR code student ID badges, multi-language support (English, Malayalam, Arabic RTL), and 6 user roles.

---

## 🌟 Key Features & Functional Modules

### 1. 6 Distinct User Roles
- **Super Admin**: Full administrative control over users, settings, database backups, and point rules.
- **Admin**: Student CRUD, house allocations, program creation, venue scheduling, and certificate issuance.
- **Judge**: Dedicated evaluation panel with 8 scoring criteria, draft saving, and final score submission locking.
- **Stage Coordinator**: Program execution status management and chest number attendance checks.
- **Student**: Profile view, participated programs, earned house points, and downloadable QR code ID cards.
- **Public Visitor**: Access to live leaderboards, public timetables, announcements, and results.

### 2. Live Scoring & WebSockets
- Real-time instant score broadcasting via **Socket.IO**.
- Animated House Standings Leaderboard that updates live as judges finalize scores without page refreshes.
- Celebratory confetti effects when competition winners are declared.

### 3. Automated Results & House Point Allocation
- Automated prize calculation for **1st Prize (10 pts)**, **2nd Prize (7 pts)**, **3rd Prize (5 pts)**, and **Participation (3 pts)**.
- **Tie-Breaking Algorithm**: Evaluates Presentation → Pronunciation → Admin Decision.
- Auto-updates house standings, gold/silver/bronze medal tallies, and overall championship ranks.

### 4. Digital PDF Certificates & Reports Engine
- **5 Certificate Types**: Winner, Participation, Judge, Volunteer, and Stage Coordinator certificates with gold foil borders and Madrasa signatures.
- Export student rosters, house tallies, program execution schedules, and financial expense reports directly to **PDF** and **Excel (`.xlsx`)**.

### 5. Bonus Features
- **QR Code Student ID Badges**: Instant printable participant badges with embedded QR codes.
- **Tri-Lingual Support**: English, Malayalam (മലയാളം), and Arabic (العربية with native RTL layout switching).
- **Global Search**: Search across students, programs, judges, results, and certificates.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS v4, Lucide React Icons, Chart.js, jsPDF, html2canvas, XLSX, Socket.IO Client, QRCode.react, Canvas Confetti.
- **Backend**: Node.js, Express.js, Socket.IO Server, JWT Authentication, bcryptjs, CORS.
- **Database**: Dual MySQL DDL (`schema.sql`, `seed.sql`) + SQLite zero-config auto-seeding fallback for local development.

---

## 📁 Directory Structure

```
site/
├── backend/
│   ├── database/
│   │   ├── schema.sql       # Full MySQL DDL Schema
│   │   ├── seed.sql         # Seed data for Milad Festival
│   │   └── db.js            # Unified DB connector (SQLite auto-seed + MySQL ready)
│   ├── src/
│   │   ├── routes/          # REST API Endpoints
│   │   └── server.js        # Express + Socket.IO server entrypoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Hero, Footer, QRCodeModal, SearchModal, etc.
│   │   ├── context/         # AuthContext, LanguageContext
│   │   ├── pages/           # All 14 Application Views & Dashboards
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── README.md
├── INSTALLATION.md
└── DEPLOYMENT.md
```
