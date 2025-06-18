// Keval Sanatani Vyapar - Main JavaScript File

let currentViewMode = 'grid';
let allBusinesses = [];
let featuredBusinesses = [];

// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
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

        // Filter only approved entries
        allBusinesses = data.filter(row => row['✅ Approved?']?.toLowerCase() === 'true');

        // Map to clean objects
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

        featuredBusinesses = allBusinesses.slice(0, 5); // Example featured logic
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
