import os
import hashlib
import secrets
import string
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", secrets.token_hex(32))


def analyze_password(password):
    has_letters = any(c.isalpha() for c in password)
    has_digits = any(c.isdigit() for c in password)
    has_symbols = any(c in string.punctuation for c in password)
    length = len(password)

    if length < 8:
        return {"level": "critical", "score": 0, "message": "💀 HACKED! Password is too short.", "label": "CRITICAL"}
    elif has_letters and not has_digits and not has_symbols:
        return {"level": "weak", "score": 25, "message": "😬 Wanna get hacked? Only characters detected.", "label": "WEAK"}
    elif has_letters and has_digits and not has_symbols:
        return {"level": "medium", "score": 60, "message": "😅 Nice try! Add symbols for better security.", "label": "MEDIUM"}
    elif has_letters and has_digits and has_symbols:
        return {"level": "strong", "score": 100, "message": "🔥 RIP HACKER! Strong password detected.", "label": "STRONG"}
    else:
        return {"level": "weak", "score": 15, "message": "😬 Wanna get hacked? Only characters detected.", "label": "WEAK"}


def encrypt_password(password):
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations=260000)
    return f"pbkdf2:sha256:260000${salt}${dk.hex()}"


def generate_password(length=16):
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice("!@#$%^&*()-_=+[]{}|;:,.<>?")
    ]
    password += [secrets.choice(alphabet) for _ in range(length - 4)]
    secrets.SystemRandom().shuffle(password)
    return "".join(password)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    password = data.get("password", "")
    if not password:
        return jsonify({"error": "No password provided"}), 400
    return jsonify(analyze_password(password))


@app.route("/api/encrypt", methods=["POST"])
def encrypt():
    data = request.get_json()
    password = data.get("password", "")
    if not password:
        return jsonify({"error": "No password provided"}), 400
    return jsonify({"encrypted": encrypt_password(password), "analysis": analyze_password(password)})


@app.route("/api/generate", methods=["GET"])
def generate():
    length = max(12, min(32, request.args.get("length", 16, type=int)))
    return jsonify({"password": generate_password(length)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
