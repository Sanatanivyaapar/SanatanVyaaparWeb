// script.js — Fully Restores Language Toggle, Filters, Panchang, and Business Listing

const SHEET_URL = 'https://opensheet.vercel.app/1knsAd84F6ZY2ka8aIEbbwE1OSX5Tkx2XG_6v3CoHCSk/Form Responses 1';

// DOMContentLoaded Initialization
document.addEventListener('DOMContentLoaded', () => {
    initLanguageToggle();
    initBusinessData();
    initFilters();
    initPanchang();
    initViewToggle();
});

// Language Switcher
function initLanguageToggle() {
    const selectors = ['#language-selector', '#mobile-language-selector'];
    selectors.forEach(sel => {
        const dropdown = document.querySelector(sel);
        if (dropdown) {
            dropdown.addEventListener('change', e => {
                const lang = e.target.value;
                document.querySelectorAll('.gujarati-text, .hindi-text, .english-text').forEach(el => el.style.display = 'none');
                document.querySelectorAll(`.${lang}-text`).forEach(el => el.style.display = 'inline');
            });
        }
    });
}

// Fetch Business Data
async function initBusinessData() {
    try {
        const res = await fetch(SHEET_URL);
        const data = await res.json();
        const approved = data.filter(row => row['Approval'] === 'TRUE');
        renderBusinesses(approved);
        populateFilterOptions(approved);
    } catch (err) {
        console.error('Error fetching data:', err);
    }
}

function renderBusinesses(data) {
    const grid = document.getElementById('business-grid');
    const list = document.getElementById('business-list');
    const count = document.getElementById('business-count');

    if (!grid || !list || !count) return;

    grid.innerHTML = '';
    list.innerHTML = '';

    data.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-xl shadow-md';
        card.innerHTML = `
            <div class="text-xl font-bold mb-2">${entry['Business Name'] || ''}</div>
            <p class="text-sm text-gray-600 mb-1">${entry['Business Address'] || ''}</p>
            <p class="text-sm text-gray-600 mb-1">📍 ${entry['District'] || ''} | ${entry['Pincode'] || ''}</p>
            <a href="tel:${entry['Mobile Number']}" class="text-blue-600 font-medium">📞 ${entry['Mobile Number']}</a>
        `;
        grid.appendChild(card.cloneNode(true));
        list.appendChild(card);
    });

    count.textContent = data.length;
}

// Filter Management
function initFilters() {
    const searchInput = document.getElementById('search-input');
    const districtFilter = document.getElementById('district-filter');
    const categoryFilter = document.getElementById('category-filter');
    const pincodeFilter = document.getElementById('pincode-filter');

    [searchInput, districtFilter, categoryFilter, pincodeFilter].forEach(el => {
        if (el) {
            el.addEventListener('input', () => applyFilters());
        }
    });
}

async function applyFilters() {
    const res = await fetch(SHEET_URL);
    const data = await res.json();
    const approved = data.filter(row => row['Approval'] === 'TRUE');

    const search = document.getElementById('search-input').value.toLowerCase();
    const district = document.getElementById('district-filter').value;
    const category = document.getElementById('category-filter').value;
    const pincode = document.getElementById('pincode-filter').value;

    const filtered = approved.filter(row => {
        return (!search || row['Business Name']?.toLowerCase().includes(search) || row['Business Address']?.toLowerCase().includes(search)) &&
               (!district || row['District'] === district) &&
               (!category || row['Business Category'] === category) &&
               (!pincode || row['Pincode'] === pincode);
    });

    renderBusinesses(filtered);
}

function populateFilterOptions(data) {
    const districts = [...new Set(data.map(row => row['District']).filter(Boolean))];
    const categories = [...new Set(data.map(row => row['Business Category']).filter(Boolean))];

    const districtFilter = document.getElementById('district-filter');
    const categoryFilter = document.getElementById('category-filter');

    if (districtFilter && districtFilter.children.length <= 3) {
        districts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            districtFilter.appendChild(opt);
        });
    }

    if (categoryFilter && categoryFilter.children.length <= 3) {
        categories.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            categoryFilter.appendChild(opt);
        });
    }
}

// View Toggle
function initViewToggle() {
    const gridBtn = document.getElementById('grid-view-btn');
    const listBtn = document.getElementById('list-view-btn');
    const grid = document.getElementById('business-grid');
    const list = document.getElementById('business-list');

    if (!gridBtn || !listBtn || !grid || !list) return;

    gridBtn.addEventListener('click', () => {
        grid.style.display = 'grid';
        list.style.display = 'none';
        gridBtn.classList.add('bg-orange-500', 'text-white');
        listBtn.classList.remove('bg-orange-500', 'text-white');
    });

    listBtn.addEventListener('click', () => {
        grid.style.display = 'none';
        list.style.display = 'block';
        listBtn.classList.add('bg-orange-500', 'text-white');
        gridBtn.classList.remove('bg-orange-500', 'text-white');
    });
}

// Panchang Data Mockup
function initPanchang() {
    const tithi = document.getElementById('tithiText');
    const hinduTime = document.getElementById('hinduTimeText');
    const sunrise = document.getElementById('sunriseTime');
    const sunset = document.getElementById('sunsetTime');

    if (tithi) tithi.textContent = 'आषाढ़ कृष्ण पक्ष प्रतिपदा';
    if (hinduTime) setInterval(() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        hinduTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);

    if (sunrise) sunrise.textContent = '05:47';
    if (sunset) sunset.textContent = '19:11';
}
