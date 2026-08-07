# Oncode – Online Coding Platform
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://oncode.vercel.app/)

An online coding platform inspired by LeetCode where users can solve programming problems, submit code in multiple languages, and receive instant feedback through secure code execution.

## 📷 Screenshots

> *(Add your screenshots here: Home Page, Problem List, Problem Editor, Submission Result, Dashboard)*

---

## 🚀 Features

### Authentication
- User registration and login
- JWT authentication with HTTP-only cookies
- Secure password hashing using bcrypt
- User profile & stats

### Coding & Judge System
- Solve coding problems with custom test cases
- Support for C++ and Java
- Secure code execution using an isolated Judge0 instance
- Batch evaluation of multiple test cases
- Execution time and runtime error handling (TLE, SIGSEGV, Compilation Error, etc.)

### Problem Management
- Browse curated problems
- Difficulty levels and tags
- Search and filter functionality
- Seamless frontend markdown rendering

### Admin Dashboard
- Create and edit problems
- Manage test cases and boilerplate driver code
- Review platform-wide user submissions

---

## 🛠️ Tech Stack

### Frontend
- React / Vite
- Redux Toolkit
- Tailwind CSS & DaisyUI
- Axios

### Backend
- Node.js & Express.js
- JSON Web Tokens (JWT)
- Express Rate Limit

### Database & Caching
- MongoDB (Mongoose)
- Redis

### Code Execution
- Judge0 API (AWS EC2 Sandboxing)

---

## ⚙️ Installation

### Clone Repository
```bash
git clone https://github.com/your-username/oncode.git
```

### Install Backend
```bash
cd backend
npm install
```

### Install Frontend
```bash
cd frontend
npm install
```

### Environment Variables
Create a `.env` file in both directories.

**Backend `.env`:**
```env
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_KEY=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASS=your_redis_password
JUDGE0_BASE_URL=http://your-judge0-instance:2358
JUDGE0_AUTH_TOKEN=your_token
CLIENT_URL=http://localhost:5173
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3000
```

### Start Servers
Run this in both `frontend` and `backend` directories:
```bash
npm run dev
```

---

## 💡 What I Learned
- Secure authentication using HTTP-Only cookies and JWT
- REST API design and distributed system architecture
- Integrating and managing a remote Judge0 execution engine
- Protecting endpoints with Redis-backed rate limiting
- State management in React with Redux Toolkit

---

## 🤝 Contributing
Pull requests are welcome.

## 📜 License
MIT License
