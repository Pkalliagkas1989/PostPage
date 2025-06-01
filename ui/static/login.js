document.getElementById("guest-button").addEventListener("click", () => {
  window.location.href = "/guest";
});

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  // For now just fake login or later call your auth API
  alert("Login not implemented yet!");
});
