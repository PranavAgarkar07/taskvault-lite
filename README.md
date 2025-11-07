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
- ✅ JWT Authentication (via Django SimpleJWT)
- 🔒 **Fernet Encryption** for sensitive data (task titles stored securely)
- 🗓 Task creation with due dates and completion tracking
- ⚙️ Modular REST API for frontend integration
- 💻 Clean React frontend with Axios-based API communication

---

## 🧩 Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React + Axios |
| **Backend** | Django + Django REST Framework |
| **Auth** | JSON Web Tokens (SimpleJWT) |
| **Encryption** | Fernet (symmetric encryption) |
| **Database** | SQLite (development) / PostgreSQL (production-ready) |
| **Language** | Python 3.14+, JavaScript (ES6) |

---

## 🏗️ Project Structure

```
taskvault-lite/
├── backend/
│   ├── api/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── backend/
│   │   └── settings.py
│   └── manage.py
│
├── frontend/
│   ├── src/
│   ├── package.json
│
├── .env
├── .gitignore
└── README.md
```

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

## 🔑 Core Features

| Feature | Description |
|----------|--------------|
| 🔐 **JWT Auth** | Secure login / logout using tokens |
| 🔒 **Fernet Encryption** | Task titles encrypted at rest in DB |
| 📋 **CRUD Operations** | Add, edit, delete, mark complete |
| 📆 **Due Dates** | Optional due date field |
| 🌐 **REST API** | DRF backend serving JSON endpoints |
| ⚡ **React Frontend** | Responsive UI with Axios |

---

## 🧠 Upcoming Features

| Status | Feature | Description |
|:--:|:--|:--|
| 🚧 | **2FA (Google Authenticator)** | Add TOTP-based 2FA for secure login |
| 🚧 | **Task Prioritization** | Mark tasks as important |
| 🚧 | **Due Soon Highlighting** | Color-code tasks due soon |
| 🚧 | **Docker Deployment** | Containerize for cloud deployment |

---

## 🔒 Security Overview

| Security Layer | Technology Used |
|----------------|-----------------|
| At-rest encryption | Fernet (AES-128, URL-safe base64) |
| Authentication | JWT (stateless) |
| Password hashing | Django PBKDF2 |
| 2FA (upcoming) | pyotp + Google Authenticator |

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
