// Keval Sanatani Vyapar - Main JavaScript File

let currentViewMode = 'grid';
let allBusinesses = [];
let featuredBusinesses = [];

// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    initializeSearch();
    initializeLanguageSelector();
    initializePanchang();
    setupNavigation();
    showSection('home');
});

// Google Sheet JSON Public API URL via opensheet
const sheetURL = 'https://opensheet.elk.sh/1knsAd84F6ZY2ka8aIEbbwE1OSX5Tkx2XG_6v3CoHCSk/Form Responses 1';

// Load businesses from public Google Sheet
async function loadBusinessesFromDatabase() {
    try {
        const response = await fetch(sheetURL);
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();

        allBusinesses = data.filter(row => row['✅ Approved?']?.toLowerCase() === 'true');

        allBusinesses = allBusinesses.map(row => ({
            business_name: row['🔹 3. व्यवसाय / दुकान का नाम / Business Name ✅ Required'],
            owner_name: row['🔹 1. पूरा नाम / Full Name ✅ Required'],
            category: row['🔹 4. व्यवसाय की श्रेणी / Business Category ✅ Required'],
            district: row['🔹 6. जिला / District ✅ Required'],
            pincode: row['🔹 7. पिनकोड / Pincode ✅ Required'],
            whatsapp: row['🔹 2. मोबाइल नंबर / Mobile Number ✅ Required'],
            phone: row['🔹 2. मोबाइल नंबर / Mobile Number ✅ Required'],
            email: '',
            address: row['🔹 8. पूरा व्यापार-व्यवसायिक पता / Full Business-Proffession Address ✅ Required'],
            description: row['🔹 10. व्यवसाय का संक्षिप्त विवरण / Brief Description about your Business ✅ Required'] || '',
            business_image: extractDriveImage(row['Photo Link']) || '',
            business_type: '',
            featured: false,
            website: '',
            state: 'Gujarat',
            sanatani_id: row['Timestamp']
        }));

        featuredBusinesses = allBusinesses.slice(0, 5);
        populateFilterOptions();

        const dashboard = document.getElementById('dashboard');
        if (dashboard && !dashboard.classList.contains('hidden')) {
            displayBusinesses();
            displayFeaturedBusinesses();
        }
    } catch (error) {
        console.error('Error loading businesses:', error);
        showNotification('व्यापार लोड करने में समस्या हुई', 'error');
    }
}

function extractDriveImage(url) {
    if (!url) return '';
    const match = url.match(/[-\w]{25,}/);
    return match ? `https://drive.google.com/uc?export=view&id=${match[0]}` : url;
}

function initializeLanguageSelector() {
    const languageSelector = document.getElementById('language-selector');
    const mobileLanguageSelector = document.getElementById('mobile-language-selector');

    const savedLanguage = localStorage.getItem('selectedLanguage') || 'hindi';

    if (languageSelector) {
        languageSelector.value = savedLanguage;
        languageSelector.addEventListener('change', function () {
            switchLanguage(this.value);
            if (mobileLanguageSelector) mobileLanguageSelector.value = this.value;
        });
    }

    if (mobileLanguageSelector) {
        mobileLanguageSelector.value = savedLanguage;
        mobileLanguageSelector.addEventListener('change', function () {
            switchLanguage(this.value);
            if (languageSelector) languageSelector.value = this.value;
        });
    }

    switchLanguage(savedLanguage);
}

function switchLanguage(language) {
    document.querySelectorAll('.gujarati-text, .hindi-text, .english-text').forEach(el => {
        el.style.display = 'none';
    });

    const selector = `.${language}-text`;
    document.querySelectorAll(selector).forEach(el => {
        el.style.display = 'inline';
    });

    localStorage.setItem('selectedLanguage', language);
}

function setupNavigation() {
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

function showSection(sectionId) {
    const sections = ['home', 'dashboard', 'register', 'about'];
    sections.forEach(section => {
        const el = document.getElementById(section);
        if (el) {
            if (section === sectionId) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    });

    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('text-orange-600');
            link.classList.remove('text-gray-700');
        } else {
            link.classList.remove('text-orange-600');
            link.classList.add('text-gray-700');
        }
    });

    if (sectionId === 'dashboard') {
        displayBusinesses();
        displayFeaturedBusinesses();
    }

    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;

    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="hindi-font">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

function redirectToGoogleForm() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSdE3kVjS_o42jsoEg23Wy4-wQqBZBqVKgpFAK5IuJX1-LizXw/viewform?usp=header', '_blank');
}

function setupFormValidation() {
    const form = document.getElementById('business-registration-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('पंजीकरण फिलहाल Google Form द्वारा ही संभव है।', 'info');
            redirectToGoogleForm();
        });
    }
}
