import { fetchJSON } from './api.js';

async function performLogout() {
  await fetchJSON('http://localhost:8080/forum/api/session/logout', {
    method: 'POST',
    credentials: 'include'
  });
  sessionStorage.removeItem('csrf_token');
}

// Automatically terminate any existing session when the login page loads
// so navigating back to this page will log the user out.
document.addEventListener('DOMContentLoaded', performLogout);

// When navigating back to this page from the browser history, some browsers
// restore the page from the back-forward cache. The pageshow event with
// `persisted` set lets us detect that situation and ensure the user is logged out.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    performLogout();
  }
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
