import { fetchJSON } from './api.js';

// Handle registration form submission via fetch
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirm = document.getElementById('confirmPassword').value.trim();
  const message = document.getElementById('message');
  message.textContent = '';
  if (password !== confirm) {
    message.textContent = 'Passwords do not match';
    return;
  }
  const data = await fetchJSON('http://localhost:8080/forum/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  if (!data) return;
  window.location.href = '/login';
});
