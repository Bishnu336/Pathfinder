document.addEventListener("DOMContentLoaded", () => {
  function showForm() {
    document.getElementById("registerFormContainer").style.display = "block";
  }

  function hideForm() {
    document.getElementById("registerFormContainer").style.display = "none";
  }

  window.showForm = showForm;  // Make it accessible from inline onclick
  window.hideForm = hideForm;

  const form = document.getElementById("registerForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullname = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const interest = document.getElementById("interest").value;

    try {
      const res = await fetch("/workshop/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fullname, email, interest })
      });

      if (res.ok) {
        alert("🎉 Registration successful!");
        form.reset();
        hideForm();
      } else {
        alert("❌ Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("❌ Something went wrong.");
    }
  });
});
