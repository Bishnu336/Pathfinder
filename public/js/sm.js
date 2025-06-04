let selectedDate = '';
let selectedTime = '';
let selectedTopic = '';

// Select time
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedTime = btn.textContent;
    document.getElementById('selectedTime').value = selectedTime;
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// Select topic
document.querySelectorAll('.option-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedTopic = btn.textContent.split('\n')[0]; // get only the topic name
    document.getElementById('selectedTopic').value = selectedTopic;
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// Form submit
document.getElementById('meetingForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!selectedDate || !selectedTime || !selectedTopic) {
    alert("Please select a topic, date, and time before submitting.");
    return;
  }

  const form = e.target;
  const formData = {
    selectedTopic: selectedTopic,
    selectedDate: selectedDate,
    selectedTime: selectedTime,
    name: form.name.value,
    email: form.email.value,
    professor: form.professor.value
  };

  try {
    const response = await fetch('/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    if (response.ok) {
      alert(result.message || "Meeting scheduled successfully!");
      form.reset();
      selectedDate = selectedTime = selectedTopic = '';
      document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    } else {
      alert(result.message || "Something went wrong.");
    }
  } catch (error) {
    alert("Server error: " + error.message);
  }
});

// Generate weekday buttons (excluding Sat/Sun)
const today = new Date();
const dateButtonsContainer = document.querySelector('.dates');
const selectedDateInput = document.getElementById('selectedDate');

dateButtonsContainer.innerHTML = '';

let added = 0;
let offset = 0;

while (added < 5) {
  const candidate = new Date(today);
  candidate.setDate(today.getDate() + offset);

  const day = candidate.getDay(); // 0=Sun, 6=Sat
  if (day !== 0 && day !== 6) {
    const formatted = candidate.toISOString().split('T')[0]; // YYYY-MM-DD
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const displayDate = candidate.toLocaleDateString('en-US', options); // e.g., "Fri, May 31"

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'date-btn';
    btn.textContent = displayDate;

    btn.addEventListener('click', () => {
      selectedDate = formatted;
      selectedDateInput.value = formatted;
      document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });

    dateButtonsContainer.appendChild(btn);
    added++;
  }
  offset++;
}
