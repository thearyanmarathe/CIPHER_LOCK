/* ===== MATRIX RAIN BACKGROUND ===== */
(function initMatrix() {
  const canvas = document.getElementById('matrix-bg');
  const ctx = canvas.getContext('2d');
  let cols, drops;
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ';

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / 18);
    drops = Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(2,12,6,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff88';
    ctx.font = '13px Share Tech Mono';
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * 18, y * 18);
      if (y * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 55);
})();

/* ===== DOM REFS ===== */
const passwordInput = document.getElementById('password-input');
const toggleBtn = document.getElementById('toggle-vis');
const eyeIcon = document.getElementById('eye-icon');
const strengthBar = document.getElementById('strength-bar');
const strengthLabel = document.getElementById('strength-label');
const strengthMessage = document.getElementById('strength-message');
const encryptBtn = document.getElementById('encrypt-btn');
const generateBtn = document.getElementById('generate-btn');
const outputSection = document.getElementById('output-section');
const outputBox = document.getElementById('output-box');
const copyBtn = document.getElementById('copy-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const loaderText = document.getElementById('loader-text');
const toast = document.getElementById('toast');

// Condition chips
const condLength = document.getElementById('cond-length');
const condWeak = document.getElementById('cond-weak');
const condMedium = document.getElementById('cond-medium');
const condStrong = document.getElementById('cond-strong');

/* ===== SHOW/HIDE PASSWORD ===== */
toggleBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  eyeIcon.innerHTML = isPassword
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
});

/* ===== REAL-TIME PASSWORD ANALYSIS ===== */
let analyzeTimer;
passwordInput.addEventListener('input', () => {
  clearTimeout(analyzeTimer);
  const val = passwordInput.value;
  if (!val) {
    resetStrength();
    return;
  }
  analyzeTimer = setTimeout(() => analyzePassword(val), 180);
});

function resetStrength() {
  strengthBar.className = 'strength-bar-fill';
  strengthBar.style.width = '0%';
  strengthLabel.className = 'strength-label';
  strengthLabel.textContent = 'AWAITING INPUT';
  strengthMessage.textContent = 'Enter a password to analyze';
  [condLength, condWeak, condMedium, condStrong].forEach(c => c.classList.remove('active'));
}

async function analyzePassword(password) {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    updateStrengthUI(data);
    updateConditions(data.level, password);
  } catch (e) {
    console.error('Analysis failed:', e);
  }
}

function updateStrengthUI(data) {
  // Bar
  strengthBar.className = `strength-bar-fill level-${data.level}`;

  // Label
  strengthLabel.className = `strength-label level-${data.level}`;
  strengthLabel.textContent = data.label;

  // Message
  strengthMessage.textContent = data.message;
}

function updateConditions(level, password) {
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasDigits = /[0-9]/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);
  const longEnough = password.length >= 8;

  condLength.classList.toggle('active', longEnough);
  condWeak.classList.toggle('active', hasLetters && !hasDigits && !hasSymbols);
  condMedium.classList.toggle('active', hasLetters && hasDigits && !hasSymbols);
  condStrong.classList.toggle('active', hasLetters && hasDigits && hasSymbols);
}

/* ===== ENCRYPT ===== */
encryptBtn.addEventListener('click', async () => {
  const password = passwordInput.value.trim();
  if (!password) {
    shakeInput();
    return;
  }

  showLoading();
  try {
    const res = await fetch('/api/encrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();

    await new Promise(r => setTimeout(r, 1200)); // Show loader for effect
    hideLoading();
    displayOutput(data.encrypted);
    updateStrengthUI(data.analysis);
    updateConditions(data.analysis.level, password);
  } catch (e) {
    hideLoading();
    outputBox.innerHTML = '<span style="color:#ff3366">⚠ Encryption failed. Check server connection.</span>';
  }
});

function showLoading() {
  const messages = ['ENCRYPTING...', 'HASHING...', 'SALTING...', 'SECURING...'];
  let i = 0;
  loadingOverlay.classList.add('visible');
  loaderText.textContent = messages[0];
  window._loaderInterval = setInterval(() => {
    i = (i + 1) % messages.length;
    loaderText.textContent = messages[i];
  }, 300);
}

function hideLoading() {
  clearInterval(window._loaderInterval);
  loadingOverlay.classList.remove('visible');
}

function displayOutput(hash) {
  outputBox.innerHTML = '';
  // Typewriter effect
  let i = 0;
  const chars = hash.split('');
  const interval = setInterval(() => {
    if (i < chars.length) {
      outputBox.textContent += chars[i++];
    } else {
      clearInterval(interval);
    }
  }, 4);
}

function shakeInput() {
  passwordInput.style.animation = 'none';
  passwordInput.offsetHeight; // reflow
  passwordInput.style.animation = 'shake 0.4s ease';
  passwordInput.style.borderColor = '#ff3366';
  passwordInput.style.boxShadow = '0 0 0 2px rgba(255,51,102,0.2)';
  setTimeout(() => {
    passwordInput.style.animation = '';
    passwordInput.style.borderColor = '';
    passwordInput.style.boxShadow = '';
  }, 500);
}

// Inject shake keyframes
const style = document.createElement('style');
style.textContent = `@keyframes shake {
  0%,100%{transform:translateX(0)}
  20%{transform:translateX(-6px)}
  40%{transform:translateX(6px)}
  60%{transform:translateX(-4px)}
  80%{transform:translateX(4px)}
}`;
document.head.appendChild(style);

/* ===== GENERATE PASSWORD ===== */
generateBtn.addEventListener('click', async () => {
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span class="btn-icon">⟳</span> GENERATING...';

  try {
    const res = await fetch('/api/generate');
    const data = await res.json();

    // Typewriter fill
    passwordInput.type = 'text';
    passwordInput.value = '';
    const chars = data.password.split('');
    let i = 0;
    const iv = setInterval(() => {
      if (i < chars.length) passwordInput.value += chars[i++];
      else {
        clearInterval(iv);
        analyzePassword(data.password);
      }
    }, 30);
  } catch (e) {
    console.error('Generate failed:', e);
  } finally {
    setTimeout(() => {
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<span class="btn-icon">⟳</span> GENERATE SECURE';
    }, 800);
  }
});

/* ===== COPY ===== */
copyBtn.addEventListener('click', async () => {
  const text = outputBox.textContent.trim();
  if (!text || text.includes('//')) return;

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.classList.add('copied');
    showToast();
    setTimeout(() => copyBtn.classList.remove('copied'), 2000);
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast();
  }
});

function showToast() {
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
