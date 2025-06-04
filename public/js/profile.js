// Toggle the settings popup
function toggleSettings() {
  const popup = document.getElementById('settingsPopup');
  popup.classList.toggle('hidden');
}

// Show a temporary custom message on the page
function showPopupMessage(message, isSuccess = true) {
  let msgBox = document.getElementById('popupMessage');
  if (!msgBox) {
    msgBox = document.createElement('div');
    msgBox.id = 'popupMessage';
    msgBox.style.position = 'fixed';
    msgBox.style.top = '20px';
    msgBox.style.right = '20px';
    msgBox.style.padding = '12px 20px';
    msgBox.style.borderRadius = '10px';
    msgBox.style.zIndex = 9999;
    msgBox.style.fontWeight = 'bold';
    msgBox.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    document.body.appendChild(msgBox);
  }

  msgBox.textContent = message;
  msgBox.style.backgroundColor = isSuccess ? '#4CAF50' : '#f44336';
  msgBox.style.color = '#fff';
  msgBox.style.display = 'block';

  setTimeout(() => {
    msgBox.style.display = 'none';
  }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("profileForm");

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await res.json();
        if (result.success) {
          showPopupMessage('✅ Profile saved successfully!', true);
        } else {
          showPopupMessage('❌ Failed to save profile.', false);
        }
      } catch (err) {
        console.error(err);
        showPopupMessage('⚠️ Error submitting form.', false);
      }
    });
  }


  // Stream change listener
  const streamInput = document.getElementById("stream");
  if (streamInput) {
    streamInput.addEventListener("input", updateSubjects);
  }

  // Dynamically update subject placeholders based on stream
  function updateSubjects() {
    const stream = streamInput.value.toLowerCase();
    const subject1 = document.getElementById("subject1");
    const subject2 = document.getElementById("subject2");

    if (!subject1 || !subject2) return;

    if (stream === "science") {
      subject1.placeholder = "Physics - Enter marks";
      subject2.placeholder = "Chemistry - Enter marks";
    } else if (stream === "commerce") {
      subject1.placeholder = "Commerce - Enter marks";
      subject2.placeholder = "Accountancy - Enter marks";
    } else if (stream === "arts") {
      subject1.placeholder = "History - Enter marks";
      subject2.placeholder = "Geography - Enter marks";
    } else {
      subject1.placeholder = "Other Subject 1 - Enter marks";
      subject2.placeholder = "Other Subject 2 - Enter marks";
    }
  }
});
