document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const message = document.getElementById('message');
  message.textContent = '';
  try {
    const res = await fetch('http://localhost:8080/forum/api/session/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Login failed');
    if (data.csrf_token) {
      sessionStorage.setItem('csrf_token', data.csrf_token);
    }
    window.location.href = '/user';
  } catch (err) {
    message.textContent = err.message;
  }
});
