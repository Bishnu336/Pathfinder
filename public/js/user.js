const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', function () {
      const filter = searchInput.value.toLowerCase();
      const rows = document.querySelectorAll("tbody tr");

      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
      });
    });

    function enableEdit(id) {
      const row = document.getElementById(`row-${id}`);
      const inputs = row.querySelectorAll('input');

      inputs.forEach(input => {
        input.removeAttribute('readonly');
        input.style.backgroundColor = '#fff';
        input.style.border = '1px solid #ccc';
      });

      document.getElementById(`edit-${id}`).style.display = 'none';
      document.getElementById(`save-${id}`).style.display = 'inline-block';
    }