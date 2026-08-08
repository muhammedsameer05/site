# Production Deployment Guide

Guide for deploying the **Madrasa Milad Management System** to production hosting platforms (e.g. VPS, PM2, Vercel, Nginx).

---

## 🏗️ 1. Building the Frontend

Build the Vite production bundle:
```bash
cd frontend
npm run build
```
The compiled static assets will be output to `frontend/dist`.

---

## 🖥️ 2. Production Node.js Backend with PM2

Install PM2 globally on your server:
```bash
npm install -g pm2
```

Start the backend server using PM2:
```bash
cd backend
pm2 start src/server.js --name "madrasa-milad-backend"
pm2 save
```

---

## 🌐 3. Nginx Reverse Proxy Configuration

Sample Nginx configuration for hosting backend API, WebSockets, and serving Vite frontend assets:

```nginx
server {
    listen 80;
    server_name milad.madrasat-ul-huda.org;

    root /var/www/site/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket Proxy
    location /socket.io/ {
        proxy_pass http://localhost:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```
