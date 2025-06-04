// You can add dynamic features here later (e.g., tracking progress)
document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(box => {
    box.addEventListener('change', () => {
      alert("Progress update coming soon!");
    });
  });
});

//setting
function toggleSettings() {
    const popup = document.getElementById('settingsPopup');
    popup.classList.toggle('hidden');
  }
  

   function toggleSettings() {
   const popup = document.getElementById('settingsPopup');
    popup.classList.toggle('hidden');
  }

// Save Settings button functionality
   document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.getElementById("saveSettingsBtn");

    saveButton.addEventListener("click", function () {
      // Example: show an alert (you can replace with actual save logic)
      alert("Settings have been saved!");

      // Optionally, close the popup
      toggleSettings();
    });
  });