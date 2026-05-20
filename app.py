import os
import hashlib
import secrets
import string
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", secrets.token_hex(32))

# Characters allowed in the output strong password
CHARSET_UPPER   = string.ascii_uppercase          # A-Z
CHARSET_LOWER   = string.ascii_lowercase          # a-z
CHARSET_DIGITS  = string.digits                   # 0-9
CHARSET_SYMBOLS = "!@#$%^&*-_=+?"               # safe, typeable symbols
CHARSET_ALL     = CHARSET_UPPER + CHARSET_LOWER + CHARSET_DIGITS + CHARSET_SYMBOLS


def transform_password(password, length=16):
    """
    Deterministically transform any password into a strong 16-char usable password.
    - Same input ALWAYS gives same output (deterministic via SHA-256 seed)
    - Output always has uppercase + lowercase + digits + symbols
    - Output is exactly `length` characters (default 16)
    - User can actually USE this as a real password anywhere
    """
    # Step 1: SHA-256 hash of the input → gives us a long hex string
    raw_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()

    # Step 2: Use the hash bytes as a seed for a deterministic sequence
    hash_bytes = bytes.fromhex(raw_hash)

    # Step 3: Build output password character by character using hash bytes
    # Each byte maps to a character in CHARSET_ALL
    result = []
    for i, byte in enumerate(hash_bytes):
        if len(result) >= length:
            break
        result.append(CHARSET_ALL[byte % len(CHARSET_ALL)])

    # Step 4: Guarantee at least one of each required character type
    # Use last 4 bytes of hash for forced characters (deterministic)
    forced = [
        CHARSET_UPPER[hash_bytes[-4] % len(CHARSET_UPPER)],
        CHARSET_LOWER[hash_bytes[-3] % len(CHARSET_LOWER)],
        CHARSET_DIGITS[hash_bytes[-2] % len(CHARSET_DIGITS)],
        CHARSET_SYMBOLS[hash_bytes[-1] % len(CHARSET_SYMBOLS)],
    ]

    # Replace first 4 chars with forced chars (keeps determinism)
    result[0] = forced[0]
    result[1] = forced[1]
    result[2] = forced[2]
    result[3] = forced[3]

    return "".join(result[:length])


def analyze_password(password):
    has_letters = any(c.isalpha() for c in password)
    has_digits  = any(c.isdigit() for c in password)
    has_symbols = any(c in string.punctuation for c in password)
    length = len(password)

    if length < 8:
        return {"level": "critical", "score": 0,
                "message": "💀 HACKED! Password is too short.", "label": "CRITICAL"}
    elif has_letters and not has_digits and not has_symbols:
        return {"level": "weak", "score": 25,
                "message": "😬 Wanna get hacked? Only characters detected.", "label": "WEAK"}
    elif has_letters and has_digits and not has_symbols:
        return {"level": "medium", "score": 60,
                "message": "😅 Nice try! Add symbols for better security.", "label": "MEDIUM"}
    elif has_letters and has_digits and has_symbols:
        return {"level": "strong", "score": 100,
                "message": "🔥 RIP HACKER! Strong password detected.", "label": "STRONG"}
    else:
        return {"level": "weak", "score": 15,
                "message": "😬 Wanna get hacked? Only characters detected.", "label": "WEAK"}


def generate_password(length=16):
    """Generate a cryptographically random strong password."""
    alphabet = CHARSET_ALL
    password = [
        secrets.choice(CHARSET_UPPER),
        secrets.choice(CHARSET_LOWER),
        secrets.choice(CHARSET_DIGITS),
        secrets.choice(CHARSET_SYMBOLS),
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
    transformed = transform_password(password, length=16)
    return jsonify({
        "encrypted": transformed,
        "analysis": analyze_password(password)
    })


@app.route("/api/generate", methods=["GET"])
def generate():
    length = max(12, min(32, request.args.get("length", 16, type=int)))
    return jsonify({"password": generate_password(length)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
