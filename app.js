// API Endpoint Base Path
const API_BASE = '/api';

// Check if user is already logged in on index page load
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('nexus_auth_token');
  if (token) {
    // Optionally check token validity or redirect
    verifyTokenAndRedirect(token);
  }
});

async function verifyTokenAndRedirect(token) {
  try {
    const response = await fetch(`${API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.success) {
      window.location.href = 'dashboard.html';
    } else {
      localStorage.removeItem('nexus_auth_token');
    }
  } catch (err) {
    console.warn('Backend server not yet ready for auto-login redirect');
  }
}

// Tab Switcher
function switchTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const headerTitle = document.getElementById('headerTitle');
  const headerSubtitle = document.getElementById('headerSubtitle');

  if (tab === 'login') {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    headerTitle.textContent = 'Welcome Back';
    headerSubtitle.textContent = 'Please log in to access your dashboard account';
  } else {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    headerTitle.textContent = 'Join GlowLogic Solution';
    headerSubtitle.textContent = 'Create your account and store details in database';
  }
}

// Password Visibility Toggle
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>`;
  } else {
    input.type = 'password';
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>`;
  }
}

// Real-time Password Strength Check
function checkPasswordStrength(password) {
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');
  
  if (!password) {
    strengthBar.style.width = '0%';
    strengthText.textContent = '';
    return;
  }

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    strengthBar.style.width = '33%';
    strengthBar.style.backgroundColor = 'var(--error)';
    strengthText.textContent = 'Weak';
    strengthText.style.color = 'var(--error)';
  } else if (score <= 4) {
    strengthBar.style.width = '66%';
    strengthBar.style.backgroundColor = 'var(--warning)';
    strengthText.textContent = 'Medium';
    strengthText.style.color = 'var(--warning)';
  } else {
    strengthBar.style.width = '100%';
    strengthBar.style.backgroundColor = 'var(--success)';
    strengthText.textContent = 'Strong';
    strengthText.style.color = 'var(--success)';
  }
}

// Toast Notification Helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Helper to toggle Loading Spinner state
function setLoading(btnId, spinnerId, isLoading, text) {
  const btn = document.getElementById(btnId);
  const spinner = document.getElementById(spinnerId);
  const btnText = btn.querySelector('.btn-text');

  btn.disabled = isLoading;
  if (isLoading) {
    spinner.style.display = 'block';
    btnText.textContent = text;
  } else {
    spinner.style.display = 'none';
    btnText.textContent = text;
  }
}

// Handle Register Form Submission
async function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('regName').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  setLoading('registerSubmitBtn', 'registerSpinner', true, 'Creating Account...');

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, password })
    });

    const data = await response.json();

    if (data.success) {
      showToast(data.message || 'Account created successfully!', 'success');
      localStorage.setItem('nexus_auth_token', data.token);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
    } else {
      showToast(data.message || 'Registration failed.', 'error');
    }
  } catch (error) {
    console.error('Registration API Error:', error);
    showToast('Failed to connect to backend server. Make sure node server is running.', 'error');
  } finally {
    setLoading('registerSubmitBtn', 'registerSpinner', false, 'Create Account');
  }
}

// Handle Login Form Submission
async function handleLogin(event) {
  event.preventDefault();

  const loginInput = document.getElementById('loginInput').value.trim();
  const password = document.getElementById('loginPassword').value;

  setLoading('loginSubmitBtn', 'loginSpinner', true, 'Verifying...');

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginInput, password })
    });

    const data = await response.json();

    if (data.success) {
      showToast('Login successful! Redirecting...', 'success');
      localStorage.setItem('nexus_auth_token', data.token);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      showToast(data.message || 'Invalid login credentials.', 'error');
    }
  } catch (error) {
    console.error('Login API Error:', error);
    showToast('Cannot reach server API. Check server status.', 'error');
  } finally {
    setLoading('loginSubmitBtn', 'loginSpinner', false, 'Sign In');
  }
}
