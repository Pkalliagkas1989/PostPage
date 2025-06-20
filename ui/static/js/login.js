import { fetchJSON } from './api.js';

// Automatically terminate any existing session when the login page loads
// so navigating back to this page will log the user out.
document.addEventListener('DOMContentLoaded', async () => {
  await fetchJSON('http://localhost:8080/forum/api/session/logout', {
    method: 'POST',
    credentials: 'include'
  });
  sessionStorage.removeItem('csrf_token');
});

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
