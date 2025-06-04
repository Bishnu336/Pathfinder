function toggleSettings() {
      document.getElementById('settingsPopup').classList.toggle('hidden');
    }

    function showTab(tabName) {
      const contents = document.querySelectorAll('.tab-content');
      const tabs = document.querySelectorAll('.tab');

      contents.forEach(content => {
        content.classList.add('hidden');
      });

      tabs.forEach(tab => {
        tab.classList.remove('active');
      });

      document.getElementById(`${tabName}-content`).classList.remove('hidden');
      document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    }

    // Load default tab on page load
    document.addEventListener('DOMContentLoaded', () => {
      showTab('overview');
    });