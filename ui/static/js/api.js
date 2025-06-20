export async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (res.ok) {
    return res.json();
  }
  let data = {};
  try {
    data = await res.json();
  } catch (_) {
    // ignore parse error
  }
  const code = data.code || res.status;
  const message = data.message || res.statusText;
  window.location.href = '/error?code=' + code + '&message=' + encodeURIComponent(message);
  return null;
}
