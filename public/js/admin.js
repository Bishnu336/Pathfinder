// Toggle settings popup
function toggleSettings() {
  const popup = document.getElementById("settingsPopup");
  popup.classList.toggle("hidden");
}

// Handle dark mode toggle
document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.querySelector("#settingsPopup input[type='checkbox']:nth-of-type(2)");

  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      document.body.classList.toggle("dark-mode", darkModeToggle.checked);
      // You can optionally send this setting to the server via fetch/post
    });
  }

  // Logout button logic
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = "/logout"; // Adjust this path to your actual logout route
    });
  }
});
