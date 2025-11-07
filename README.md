# 🧠 TaskVault Lite

<p align="center">
  <b>Secure, full-stack Task Manager built with Django REST Framework & React</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Django-5.0+-092E20?style=for-the-badge&logo=django&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/REST%20API-DRF-red?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Database-SQLite-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Security-Fernet%20Encryption-green?style=for-the-badge"/>
</p>

---

## 🔐 About TaskVault Lite

**TaskVault Lite** is a secure and modern **to-do manager** designed to demonstrate full-stack development skills, data security practices, and API design using Django & React.

It supports:
- ✅ JWT Authentication (via Django SimpleJWT), Google & GitHub OAuth
- 🔒 **Fernet Encryption** for sensitive data (task titles stored securely)
- 🗓 Task creation with due dates and completion tracking
- ⚙️ Modular REST API for frontend integration
- 💻 Clean React frontend with Axios-based API communication

---
## ⚙️ Features

🔐 Authentication
- JWT-based authentication with refresh tokens
- OAuth login via Google and GitHub
- Secure token storage (no sensitive data in cookies)

📋 Task Management
- Create, edit, delete, and toggle completion
- Due dates for better planning
- Filter by all / completed / pending
- Encrypted titles in the database

🔒 Security & Performance
- Fernet encryption (AES-128 under the hood)
- CSRF & CORS protection enabled
- Built on Django 5.0+ and React 18 with Vite
- Local development ready, cloud deployable
---

## 🧩 Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Frontend   | React (Vite, Axios)                               |
| Backend    | Django + Django REST Framework                    |
| Auth       | JWT (SimpleJWT) + Django-Allauth (Google, GitHub) |
| Database   | SQLite (default, easy to migrate to PostgreSQL)   |
| Encryption | Fernet (Cryptography)                             |
| API Auth   | Bearer Token                                      |
| Deployment | Docker / Render / Railway Ready                   |

---



## ⚙️ Setup Instructions

### 🐍 Backend Setup (Django)
```bash
git clone https://github.com/<your-username>/taskvault-lite.git
cd taskvault-lite/backend

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```
Add this to `.env`:
```
FERNET_KEY=your_generated_key_here
```

Then run:
```bash
python manage.py migrate
python manage.py runserver
```

---

### ⚛️ Frontend Setup (React)
```bash
cd ../frontend
npm install
npm start
```

---

# 🔑 OAuth Setup Guide (Google & GitHub)

This guide explains how to configure Google and GitHub OAuth for **TaskVault Lite** (Django + React).

---

## 🟢 Google OAuth Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/).
2. Create OAuth credentials:
   - **Authorized JavaScript Origins:**
     ```
     http://127.0.0.1:8000
     http://127.0.0.1:5173
     ```
   - **Authorized Redirect URI:**
     ```
     http://127.0.0.1:8000/accounts/google/login/callback/
     ```
3. Copy your **Client ID** and **Client Secret**.
4. Open **http://127.0.0.1:8000/admin/**
   - Go to **Social Applications → Add Social Application**
   - Provider: `Google`
   - Add your credentials
   - Select Site: `127.0.0.1:8000`
5. Save and test:
   ```
   http://127.0.0.1:8000/accounts/google/login/
   ```

---

## 🐙 GitHub OAuth Setup

1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers).
2. Register a new app:
   - **Homepage URL:** `http://127.0.0.1:8000`
   - **Authorization Callback URL:**  
     `http://127.0.0.1:8000/accounts/github/login/callback/`
3. Copy **Client ID** and **Client Secret**.
4. Add in Django Admin:
   - Provider: `GitHub`
   - Add credentials
   - Select Site: `127.0.0.1:8000`
5. Save and test:
   ```
   http://127.0.0.1:8000/accounts/github/login/
   ```

---

✅ **Done!**  
Your app now supports secure login via **Google** and **GitHub** using Django-Allauth.


---

## 🧠 Upcoming Features

| Feature                                    | Description                                   |
| ------------------------------------------ | --------------------------------------------- |
| 🏷️ **Task Priority**                      | Add low/medium/high priority levels for tasks |
| ⏰ **Due Soon Alerts**                      | Highlight tasks nearing their deadlines       |
| 📊 **Analytics Dashboard**                 | Visualize task completion and progress trends |
| 🔐 **2FA Security (Google Authenticator)** | Optional two-factor authentication            |
| 🤖 **AI Task Suggestions**                 | Suggest task priorities or reminders using AI |
| 🐳 **Docker & Cloud Deployment**           | Containerize and deploy to Render/Railway     |
| 🌙 **Dark Mode**                           | Toggle between light and dark themes          |


---

## 🔒 Security Overview

| Security Layer     | Technology Used                          |
| ------------------ | ---------------------------------------- |
| At-rest encryption | Fernet (AES-128)                         |
| Authentication     | JWT (stateless)                          |
| Password hashing   | PBKDF2                                   |
| OAuth              | Django-Allauth                           |
| CSRF & CORS        | Enabled                                  |
| 2FA                | (Planned with TOTP/Google Authenticator) |

---

## 🧰 Example API Endpoints

| Endpoint | Method | Description | Auth Required |
|-----------|---------|--------------|----------------|
| `/api/register/` | POST | Create new user | ❌ |
| `/api/login/` | POST | Obtain JWT token | ❌ |
| `/api/tasks/` | GET | List user tasks | ✅ |
| `/api/tasks/` | POST | Add task | ✅ |
| `/api/tasks/<id>/` | PUT | Update task | ✅ |
| `/api/tasks/<id>/` | DELETE | Delete task | ✅ |

---

## 🧑‍💻 Developer

**👋 Pranav Agarkar**  
💼 *Engineering Student (CSE), aspiring Cybersecurity & Backend Engineer*  
📍 Solapur, India  

- 💻 Focus: Cybersecurity, Backend, Frontend
- 🐧 Environment: Fedora KDE, Python, React  
- 🌐 GitHub: [@pranavagarkar07](https://github.com/pranavagarkar07)

---

## 📜 License

Licensed under the **MIT License** — feel free to use and modify.

---

<p align="center"><b>“Code securely. Build smart. Automate everything.”</b><br/>— Pranav Agarkar ⚡</p>
