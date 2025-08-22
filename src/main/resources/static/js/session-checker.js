let sessionCheckInterval = null;

function checkSession() {
  fetch("/api/session-status", {
    method: "GET",
    credentials: "include",
    headers: {
      "Accept": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Invalid session");
      return res.json();
    })
    .then((data) => {
      if (!data.isValid) {
        console.warn("Session invalidated. Redirecting to /login...");
        clearInterval(sessionCheckInterval);
        window.location.href = "/login";
      }
    })
    .catch(() => {
      console.warn("Session expired or error checking session.");
      clearInterval(sessionCheckInterval);
      window.location.href = "/login";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  sessionCheckInterval = setInterval(checkSession, 5000); // every 5 seconds
});
