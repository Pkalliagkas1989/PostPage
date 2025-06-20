import { fetchJSON } from './api.js';

async function checkSession() {
  try {
    const res = await fetch('http://localhost:8080/forum/api/session/verify', {
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.csrf_token) {
        sessionStorage.setItem('csrf_token', data.csrf_token);
      }
      window.location.href = '/user';
    }
  } catch (_) {
    // ignore network errors and stay on the page
  }
}

document.addEventListener('DOMContentLoaded', checkSession);

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const message = document.getElementById('message');
  message.textContent = '';
  const data = await fetchJSON('http://localhost:8080/forum/api/session/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  if (!data) return;
  if (data.csrf_token) {
    sessionStorage.setItem('csrf_token', data.csrf_token);
  }
  window.location.href = '/user';
});
