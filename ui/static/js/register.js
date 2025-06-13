
    document.getElementById("registerForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const message = document.getElementById("message");

        message.textContent = "";
        message.style.color = "red";

        if (password !== confirmPassword) {
          message.textContent = "Passwords do not match!";
          return;
        }

        try {
          const res = await fetch("http://localhost:8080/forum/api/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
          });

          const resBody = await res.text();

          if (!res.ok) {
            throw new Error(resBody || "Registration failed");
          }

          message.style.color = "green";
          message.textContent = "Registration successful!";
          // Optionally redirect
          // setTimeout(() => window.location.href = "login.html", 1500);
        } catch (err) {
          message.textContent = "Error: " + err.message;
        }
    });