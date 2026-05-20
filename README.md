# 🔐 CipherLock — Password Encryption Tool

![Python](https://img.shields.io/badge/Python-3.8+-00ff88?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0+-00ff88?style=flat-square&logo=flask&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-00ff88?style=flat-square)

A professional cybersecurity-themed password encryption web application built with Python Flask. Analyze password strength, encrypt with PBKDF2-HMAC-SHA256, and generate cryptographically secure passwords — all in a stunning hacker aesthetic UI.

---

## ✨ Features

- 🔍 **Real-time Password Analysis** — Instant strength feedback as you type
- 🔐 **PBKDF2-HMAC-SHA256 Encryption** — 260,000 iterations with 128-bit salt
- 🎲 **Secure Password Generator** — Cryptographically random passwords using `secrets`
- 📊 **Visual Strength Meter** — Animated progress bar with color-coded levels
- 👁️ **Show/Hide Toggle** — Reveal or mask your password
- 📋 **One-Click Copy** — Copy encrypted hash with toast notification
- 🌧️ **Matrix Rain Background** — Animated cyberpunk aesthetic
- 📱 **Fully Responsive** — Works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.8+, Flask 3.x |
| Encryption | hashlib (PBKDF2-HMAC-SHA256) |
| Random | secrets (cryptographically secure) |
| Frontend | Vanilla HTML5, CSS3, JavaScript |
| Fonts | Orbitron, JetBrains Mono, Share Tech Mono |
| Deployment | Gunicorn + Render/Railway/Replit |

---

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/cipherlock.git
cd cipherlock
```

### 2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate           # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the application
```bash
python app.py
```

### 5. Open in browser
```
http://localhost:5000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main application page |
| POST | `/api/analyze` | Analyze password strength |
| POST | `/api/encrypt` | Encrypt password with PBKDF2 |
| GET | `/api/generate` | Generate a secure random password |

### Example request:
```bash
curl -X POST http://localhost:5000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{"password": "MyP@ssw0rd!"}'
```

---

## ☁️ Deployment

### Render
1. Push to GitHub
2. Connect repo on [render.com](https://render.com)
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `gunicorn app:app`
5. Add env var: `SECRET_KEY=your-random-secret`

### Railway
1. Push to GitHub
2. Import on [railway.app](https://railway.app)
3. Railway auto-detects Flask — set start command to `gunicorn app:app`

### Replit
1. Import repo on [replit.com](https://replit.com)
2. Set run command: `gunicorn app:app --bind 0.0.0.0:5000`

---

## 🔒 Security Notes

- ✅ No passwords are ever stored — encryption is stateless per request
- ✅ Salt is randomly generated for each encryption (128-bit)
- ✅ PBKDF2 with 260,000 iterations (NIST recommended)
- ✅ Random password generation uses Python `secrets` module (CSPRNG)
- ⚠️ This is a demonstration tool — do not use generated hashes as-is in production auth systems without a proper user/salt storage strategy

---

## 📸 Screenshots

> _Add screenshots here after deployment_

---

## 📄 License

MIT © 2025 — Built for cybersecurity portfolio demonstration.
