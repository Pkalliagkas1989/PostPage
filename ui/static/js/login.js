      document
        .getElementById("loginForm")
        .addEventListener("submit", async function (e) {
          e.preventDefault();

          const email = document.getElementById("email").value;
          const password = document.getElementById("password").value;
          const message = document.getElementById("message");

          message.textContent = "";
          message.style.color = "red";

          try {
            const res = await fetch(
              "http://localhost:8080/forum/api/session/login",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  //"X-CSRF-Token": sessionStorage.getItem("csrf_token"),
                },
                // 💡 Important: Include credentials to allow cookies to be set
                credentials: "include", // 💡 important: allows cookies to be set
                body: JSON.stringify({ email, password }),
              }
            );

            if (!res.ok) {
              const errText = await res.text();
              throw new Error(errText);
            }

            const result = await res.json();
            message.style.color = "green";
            message.textContent = "Login successful!";
            // ✅ Store CSRF token in sessionStorage (or localStorage if session is not enough)
            sessionStorage.setItem("csrf_token", result.csrf_token);

            // Redirect to protected area
            window.location.href = "/user";
          } catch (err) {
            message.textContent = "Error: " + err.message;
          }
        });