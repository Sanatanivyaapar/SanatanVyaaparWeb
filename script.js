const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQPxPguZfmRO6sfXoq59g2WVSzPc0Xi677vlXnBtbvVeOQ34YrxG0hIs6CP7q8LCV3672s4qazssR6x/pub?gid=1529767758&single=true&output=csv';

const districts = new Set();
const pincodes = new Set();
const categories = new Set();
let allData = [];

function fetchCSVData() {
  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').map(row => row.split(','));
      const headers = rows[0];
      allData = rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, i) => obj[header.trim()] = row[i]?.trim());
        return obj;
      });

      populateFilters();
      displayCards(allData);
    });
}

function populateFilters() {
  const districtSelect = document.getElementById('districtFilter');
  const pincodeSelect = document.getElementById('pincodeFilter');
  const categorySelect = document.getElementById('categoryFilter');

  allData.forEach(entry => {
    if (entry['District']) districts.add(entry['District']);
    if (entry['Pincode']) pincodes.add(entry['Pincode']);
    if (entry['Business Category']) categories.add(entry['Business Category']);
  });

  [districtSelect, pincodeSelect, categorySelect].forEach(select => {
    select.innerHTML = `<option value="">-- सभी --</option>`;
  });

  Array.from(districts).sort().forEach(d => {
    districtSelect.innerHTML += `<option value="${d}">${d}</option>`;
  });
  Array.from(pincodes).sort().forEach(p => {
    pincodeSelect.innerHTML += `<option value="${p}">${p}</option>`;
  });
  Array.from(categories).sort().forEach(c => {
    categorySelect.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function filterAndDisplay() {
  const district = document.getElementById('districtFilter').value;
  const pincode = document.getElementById('pincodeFilter').value;
  const category = document.getElementById('categoryFilter').value;
  const query = document.getElementById('searchInput').value.toLowerCase();

  const filtered = allData.filter(entry => {
    return (!district || entry['District'] === district) &&
           (!pincode || entry['Pincode'] === pincode) &&
           (!category || entry['Business Category'] === category) &&
           (
             entry['Full Name'].toLowerCase().includes(query) ||
             entry['Business Name'].toLowerCase().includes(query) ||
             entry['Business Address'].toLowerCase().includes(query)
           );
  });

  displayCards(filtered);
}

function displayCards(data) {
  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';

  if (data.length === 0) {
    container.innerHTML = '<p>कोई व्यवसाय नहीं मिला।</p>';
    return;
  }

  data.forEach(entry => {
    const imageUrl = convertGoogleDriveLink(entry['Shop Photo']);
    const card = `
      <div class="card">
        <img src="${imageUrl}" alt="फोटो" onerror="this.style.display='none'">
        <h3>${entry['Business Name'] || 'नाम नहीं'}</h3>
        <p><strong>नाम:</strong> ${entry['Full Name']}</p>
        <p><strong>मोबाइल:</strong> ${entry['Mobile Number']}</p>
        <p><strong>पता:</strong> ${entry['Business Address']}</p>
      </div>
    `;
    container.innerHTML += card;
  });
}

function convertGoogleDriveLink(url) {
  if (!url) return '';
  const match = url.match(/[-\w]{25,}/);
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[0]}`;
  }
  return url;
}

document.addEventListener('DOMContentLoaded', () => {
  fetchCSVData();
  document.getElementById('districtFilter').addEventListener('change', filterAndDisplay);
  document.getElementById('pincodeFilter').addEventListener('change', filterAndDisplay);
  document.getElementById('categoryFilter').addEventListener('change', filterAndDisplay);
  document.getElementById('searchInput').addEventListener('input', filterAndDisplay);
});
