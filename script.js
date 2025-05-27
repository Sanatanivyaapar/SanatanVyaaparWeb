// Sanatan Vyaapar - Complete JavaScript functionality
// Gujarat-focused business directory with proper Hindu calendar

// Language Management
let currentLanguage = 'hindi';

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupLanguageSelector();
    loadBusinessesFromDatabase();
    setupEventListeners();
    setupFormValidation();
    initializePanchang();
    initializeSearch();
}

// Navigation Setup
function setupNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!mobileMenuBtn?.contains(event.target) && !mobileMenu?.contains(event.target)) {
            mobileMenu?.classList.add('hidden');
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                showSection(this.getAttribute('href').substring(1));
            }
        });
    });
}

// Language Management
function setupLanguageSelector() {
    const languageSelector = document.getElementById('language-selector');
    const mobileLanguageSelector = document.getElementById('mobile-language-selector');

    [languageSelector, mobileLanguageSelector].forEach(selector => {
        if (selector) {
            selector.addEventListener('change', function() {
                switchLanguage(this.value);
                // Sync both selectors
                if (languageSelector && mobileLanguageSelector) {
                    languageSelector.value = this.value;
                    mobileLanguageSelector.value = this.value;
                }
            });
        }
    });
}

function switchLanguage(language) {
    currentLanguage = language;

    // Hide all language variants
    document.querySelectorAll('.gujarati-text, .hindi-text, .english-text').forEach(el => {
        el.style.display = 'none';
    });

    // Show selected language
    const targetClass = `.${language}-text`;
    document.querySelectorAll(targetClass).forEach(el => {
        el.style.display = 'inline';
    });

    // Update search placeholders based on language
    updateSearchPlaceholders(language);
}

function updateSearchPlaceholders(language) {
    const searchInput = document.getElementById('search-input');
    const districtFilter = document.getElementById('district-filter');
    const categoryFilter = document.getElementById('category-filter');
    const pincodeFilter = document.getElementById('pincode-filter');

    const placeholders = {
        gujarati: {
            search: 'વ્યાપાર શોધો...',
            district: 'જિલ્લો પસંદ કરો',
            category: 'શ્રેણી પસંદ કરો',
            pincode: 'પિનકોડ'
        },
        hindi: {
            search: 'व्यापार खोजें...',
            district: 'जिला चुनें',
            category: 'श्रेणी चुनें',
            pincode: 'पिनकोड'
        },
        english: {
            search: 'Search businesses...',
            district: 'Select District',
            category: 'Select Category',
            pincode: 'Pincode'
        }
    };

    if (searchInput) searchInput.placeholder = placeholders[language].search;
    if (districtFilter) districtFilter.options[0].textContent = placeholders[language].district;
    if (categoryFilter) categoryFilter.options[0].textContent = placeholders[language].category;
    if (pincodeFilter) pincodeFilter.placeholder = placeholders[language].pincode;
}

// Business Data Management
let businessesData = [];
let filteredBusinesses = [];
let currentViewMode = 'grid';

function loadBusinessesFromDatabase() {
    fetch('/api/businesses')
        .then(response => response.json())
        .then(data => {
            if (data.businesses) {
                businessesData = data.businesses;
                filteredBusinesses = [...businessesData];
                displayBusinesses();
                updateResultsCount(businessesData.length);
                loadFeaturedBusinesses();
                populateFilters();
            }
        })
        .catch(error => {
            console.log('Failed to load businesses');
            loadSampleBusinesses();
        });
}

function loadSampleBusinesses() {
    // Sample businesses for Gujarat
    businessesData = [
        {
            id: 1,
            sanatani_id: 'SN-HOS-0001',
            business_name: 'गुजराती स्वीट्स',
            owner_name: 'श्री रमेश पटेल',
            business_type: 'रिटेल',
            category: 'खानपान / મિઠાઈ / નાસ્તો',
            district: 'अहमदाबाद',
            state: 'गुजरात',
            pincode: '380001',
            address: 'लाल दरवाजा, अहमदाबाद',
            whatsapp: '9876543210',
            phone: '079-12345678',
            email: 'ramesh@example.com',
            featured: true
        },
        {
            id: 2,
            sanatani_id: 'SN-TEX-0001',
            business_name: 'सनाथन वस्त्रालय',
            owner_name: 'श्री किशोरभाई शाह',
            business_type: 'रिટેલ',
            category: 'વસ્ત્ર',
            district: 'सुरत',
            state: 'गुजरात',
            pincode: '395003',
            address: 'रिंग रोड, સુરત',
            whatsapp: '9876543211',
            phone: '0261-1234567',
            email: 'kishore@example.com',
            featured: true
        }
    ];

    filteredBusinesses = [...businessesData];
    displayBusinesses();
    updateResultsCount(businessesData.length);
    loadFeaturedBusinesses();
    populateFilters();
}

function populateFilters() {
    populateDistrictFilter();
    populateCategoryFilter();
}

function populateDistrictFilter() {
    const districtFilter = document.getElementById('district-filter');
    if (!districtFilter) return;

    // Clear existing options except first
    while (districtFilter.children.length > 1) {
        districtFilter.removeChild(districtFilter.lastChild);
    }

    // Gujarat districts only
    const gujaratDistricts = [
        'અમદાવાદ', 'અમરેલી', 'આણંદ', 'બનાસકાંઠા', 'ભરૂચ', 'ભાવનગર',
        'બોટાદ', 'છોટાઉદેપુર', 'દાહોદ', 'દાંગ', 'દેવભૂમિ દ્વારકા', 'ગાંધીનગર',
        'ગીર સોમનાથ', 'જામનગર', 'જુનાગઢ', 'ખેડા', 'કચ્છ', 'મહિસાગર',
        'મેહસાણા', 'મોરબી', 'નર્મદા', 'નવસારી', 'પાટણ', 'પંચમહાલ',
        'પોરબંદર', 'રાજકોટ', 'સાબરકાંઠા', 'સુરત', 'સુરેન્દ્રનગર', 'તાપી',
        'વડોદરા', 'વલસાડ'
    ];

    gujaratDistricts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtFilter.appendChild(option);
    });
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;

    // Clear existing options except first
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }

    // Updated business categories
    const categories = [
        'ખાનપાન / મિઠાઈ / નાસ્તો',
        'કપડાં / વસ્ત્ર',
        'દવાખાનું / મેડિકલ સ્ટોર',
        'કરિયાણા / જનરલ સ્ટોર',
        'આભૂષણ / સોનાર',
        'ફર્નિચર / હોમ ડેકોર',
        'ઇલેક્ટ્રોનિક્સ / મોબાઇલ',
        'ગેરેજ / ઓટો રિપેર',
        'બ્યુટી પાર્લર / સલૂન',
        'કન્સ્ટ્રક્શન / બિલ્ડર',
        'ટ્રાન્સપોર્ટ / લોજિસ્ટિક્સ',
        'આયુર્વેદ / પંચકર્મ',
        'શિક્ષણ / કોચિંગ',
        'ફોટોગ્રાફી / વિડિયોગ્રાફી',
        'CA / ટેક્સ કન્સલ્ટન્ટ',
        'વકીલ / કાનૂની સેવા',
        'રિયલ એસ્ટેટ / પ્રોપર્ટી',
        'કૃષિ / ખેતી સાધનો',
        'ઓનલાઇન બિઝનેસ / ઇ-કોમર્સ',
        'NGO / સામાજિક સેવા',
        'હસ્તકલા / કુટીર ઉદ્યોગ',
        'ટ્રાવેલ એજન્ટ / ટુરિઝમ',
        'ખેલ સામગ્રી / ફિટનેસ',
        'પુસ્તક / સ્ટેશનરી',
        'હોમ બેસ્ડ બિઝનેસ'
    ];

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Search and Filter Functions
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const districtFilter = document.getElementById('district-filter');
    const categoryFilter = document.getElementById('category-filter');
    const pincodeFilter = document.getElementById('pincode-filter');

    [searchInput, districtFilter, categoryFilter, pincodeFilter].forEach(element => {
        if (element) {
            element.addEventListener('input', filterBusinesses);
            element.addEventListener('change', filterBusinesses);
        }
    });
}

function filterBusinesses() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const selectedDistrict = document.getElementById('district-filter')?.value || '';
    const selectedCategory = document.getElementById('category-filter')?.value || '';
    const selectedPincode = document.getElementById('pincode-filter')?.value || '';

    filteredBusinesses = businessesData.filter(business => {
        const matchesSearch = !searchTerm || 
            business.business_name.toLowerCase().includes(searchTerm) ||
            business.owner_name.toLowerCase().includes(searchTerm) ||
            business.category.toLowerCase().includes(searchTerm) ||
            business.district.toLowerCase().includes(searchTerm);

        const matchesDistrict = !selectedDistrict || business.district === selectedDistrict;
        const matchesCategory = !selectedCategory || business.category === selectedCategory;
        const matchesPincode = !selectedPincode || business.pincode.includes(selectedPincode);

        return matchesSearch && matchesDistrict && matchesCategory && matchesPincode;
    });

    displayBusinesses();
    updateResultsCount(filteredBusinesses.length);
}

function displayBusinesses() {
    if (currentViewMode === 'grid') {
        displayBusinessGrid();
    } else {
        displayBusinessList();
    }
}

function displayBusinessGrid() {
    const businessGrid = document.getElementById('business-grid');
    const businessList = document.getElementById('business-list');
    const noResults = document.getElementById('no-results');

    if (!businessGrid) return;

    businessGrid.style.display = 'grid';
    if (businessList) businessList.style.display = 'none';

    if (filteredBusinesses.length === 0) {
        businessGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }

    if (noResults) noResults.style.display = 'none';

    businessGrid.innerHTML = filteredBusinesses.map(business => `
        <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${business.business_name}</h3>
                    <p class="text-gray-600 mb-1">${business.owner_name}</p>
                    <p class="text-sm text-orange-600 font-medium">${business.category}</p>
                </div>
                ${business.featured ? '<div class="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">विशेष</div>' : ''}
            </div>

            <div class="space-y-2 mb-4">
                <div class="flex items-center text-gray-600 text-sm">
                    <i class="fas fa-map-marker-alt w-4"></i>
                    <span>${business.district}, ${business.state} - ${business.pincode}</span>
                </div>
                <div class="flex items-center text-gray-600 text-sm">
                    <i class="fas fa-home w-4"></i>
                    <span>${business.address}</span>
                </div>
            </div>

            <div class="flex gap-2">
                <a href="https://wa.me/91${business.whatsapp}" target="_blank" 
                   class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center flex-1">
                    <i class="fab fa-whatsapp mr-2"></i>WhatsApp
                </a>
                ${business.phone ? `
                <a href="tel:+91${business.phone}" 
                   class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center flex-1">
                    <i class="fas fa-phone mr-2"></i>कॉल
                </a>` : ''}
            </div>
        </div>
    `).join('');
}

function displayBusinessList() {
    const businessGrid = document.getElementById('business-grid');
    const businessList = document.getElementById('business-list');
    const noResults = document.getElementById('no-results');

    if (!businessList) return;

    businessList.style.display = 'block';
    if (businessGrid) businessGrid.style.display = 'none';

    if (filteredBusinesses.length === 0) {
        businessList.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }

    if (noResults) noResults.style.display = 'none';

    businessList.innerHTML = filteredBusinesses.map(business => `
        <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-lg font-bold text-gray-800">${business.business_name}</h3>
                        ${business.featured ? '<span class="bg-orange-500 text-white px-2 py-1 rounded-full text-xs">विशेष</span>' : ''}
                    </div>
                    <p class="text-gray-600 mb-1">${business.owner_name}</p>
                    <p class="text-sm text-orange-600 font-medium mb-2">${business.category}</p>
                    <p class="text-sm text-gray-600">${business.district}, ${business.state} - ${business.pincode}</p>
                </div>
                <div class="flex gap-2">
                    <a href="https://wa.me/91${business.whatsapp}" target="_blank" 
                       class="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                    ${business.phone ? `
                    <a href="tel:+91${business.phone}" 
                       class="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        <i class="fas fa-phone"></i>
                    </a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function loadFeaturedBusinesses() {
    const featuredBusinesses = businessesData.filter(business => business.featured).slice(0, 3);
    const featuredContainer = document.getElementById('featured-businesses');

    if (!featuredContainer) return;

    featuredContainer.innerHTML = featuredBusinesses.map(business => `
        <div class="bg-white/10 rounded-lg p-4 text-white">
            <h4 class="font-semibold mb-1">${business.business_name}</h4>
            <p class="text-sm opacity-90">${business.category}</p>
            <p class="text-xs opacity-75">${business.district}</p>
        </div>
    `).join('');
}

function setViewMode(mode) {
    currentViewMode = mode;

    const gridBtn = document.getElementById('grid-view-btn');
    const listBtn = document.getElementById('list-view-btn');

    if (mode === 'grid') {
        gridBtn?.classList.add('bg-orange-500', 'text-white');
        gridBtn?.classList.remove('bg-gray-300', 'text-gray-700');
        listBtn?.classList.add('bg-gray-300', 'text-gray-700');
        listBtn?.classList.remove('bg-orange-500', 'text-white');
    } else {
        listBtn?.classList.add('bg-orange-500', 'text-white');
        listBtn?.classList.remove('bg-gray-300', 'text-gray-700');
        gridBtn?.classList.add('bg-gray-300', 'text-gray-700');
        gridBtn?.classList.remove('bg-orange-500', 'text-white');
    }

    displayBusinesses();
}

function updateResultsCount(count) {
    const countElement = document.getElementById('business-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Section Management
function showSection(sectionId) {
    // Hide all sections
    const sections = ['home', 'dashboard', 'register', 'about'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Special handling for dashboard section
    if (sectionId === 'dashboard') {
        displayBusinesses();
        loadFeaturedBusinesses();
    }

    // Close mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL without page reload
    history.pushState(null, null, `#${sectionId}`);
}

// Form Validation and Handling
function setupFormValidation() {
    const form = document.getElementById('business-registration-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const businessData = Object.fromEntries(formData.entries());

        // Basic validation
        if (!businessData.businessName || !businessData.ownerName || !businessData.whatsapp) {
            showNotification('कृपया सभी आवश्यक फील्ड भरें', 'error');
            return;
        }

        // Phone number validation
        if (!/^[0-9]{10}$/.test(businessData.whatsapp)) {
            showNotification('कृपया सही WhatsApp नंबर दर्ज करें', 'error');
            return;
        }

        if (!/^[0-9]{6}$/.test(businessData.pincode)) {
            showNotification('कृपया सही पिनकोड दर्ज करें', 'error');
            return;
        }

        try {
            // Simulate form submission
            showNotification('आपका व्यापार सफलतापूर्वक पंजीकृत हो गया! सत्यापन के बाद यह दिखेगा।', 'success');
            form.reset();
            showSection('home');
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('सर्वर से कनेक्शन में समस्या', 'error');
        }
    });
}

function setupEventListeners() {
    // Section navigation
    document.addEventListener('click', function(event) {
        if (event.target.matches('[onclick*="showSection"]')) {
            const match = event.target.getAttribute('onclick').match(/showSection\('(.+?)'\)/);
            if (match) {
                showSection(match[1]);
            }
        }
    });

    // View mode buttons
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');

    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    }
    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => setViewMode('list'));
    }
}

// Panchang and Hindu Calendar Functions
function initializePanchang() {
    updatePanchangData();
    updateHinduTime();
    updateSpecialEvents();

    // Update every minute
    setInterval(updateHinduTime, 60000);
    // Update panchang data once a day
    setInterval(updatePanchangData, 24 * 60 * 60 * 1000);
}

function updatePanchangData() {
    const today = new Date();

    // Calculate current tithi (simplified calculation)
    const tithiNames = [
        'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 
        'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा', 'अमावस्या'
    ];

    // Simplified tithi calculation based on lunar day
    const lunarDay = Math.floor((today.getDate() % 30) / 2);
    const currentTithi = tithiNames[lunarDay] || 'प्रतिपदा';

    // Calculate paksha
    const paksha = today.getDate() <= 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';

    // Regular date
    const regularDate = today.toLocaleDateString('hi-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('tithiText').textContent = `${currentTithi} (${paksha}) | ${regularDate}`;

    // Calculate sunrise and sunset for Gujarat (approximate)
    updateSunTimes();
}

function updateHinduTime() {
    const now = new Date();

    // Convert to IST if needed
    const istOffset = 5.5 * 60; // IST is UTC+5:30
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (istOffset * 60000));

    // Regular time
    const regularTime = ist.toLocaleTimeString('hi-IN', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // Hindu time calculation (simplified)
    const dayMinutes = ist.getHours() * 60 + ist.getMinutes();
    const daySeconds = dayMinutes * 60 + ist.getSeconds();

    // 1 day = 24 hours = 30 muhurta = 60 ghati = 3600 pal = 216000 vipal
    const totalVipal = Math.floor((daySeconds / 86400) * 216000);
    const ghati = Math.floor(totalVipal / 3600);
    const pal = Math.floor((totalVipal % 3600) / 60);
    const vipal = totalVipal % 60;

    const hinduTimeElement = document.getElementById('hinduTimeText');
    if (hinduTimeElement) {
        hinduTimeElement.innerHTML = `${ghati} घटी ${pal} पल ${vipal} विपल<br><small>${regularTime}</small>`;
    }
}

function updateSunTimes() {
    // Simplified calculation for Gujarat (Ahmedabad coordinates)
    const now = new Date();
    const sunrise = new Date(now);
    const sunset = new Date(now);

    // Approximate times for Gujarat
    sunrise.setHours(6, 30, 0);
    sunset.setHours(18, 30, 0);

    const sunriseElement = document.getElementById('sunriseTime');
    const sunsetElement = document.getElementById('sunsetTime');

    if (sunriseElement) {
        sunriseElement.textContent = sunrise.toLocaleTimeString('hi-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    if (sunsetElement) {
        sunsetElement.textContent = sunset.toLocaleTimeString('hi-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
}

function updateSpecialEvents() {
    const specialEvents = [
        '🚩 आज महाशिवरात्रि का पावन पर्व 🚩',
        '🚩 गुजरात के सनातनी व्यापारियों से जुड़ें 🚩',
        '🚩 धार्मिक व्यापार नेटवर्क में शामिल हों 🚩',
        '🚩 केवल सत्यापित व्यापारी 🚩'
    ];

    const eventsElement = document.getElementById('specialEvents');
    if (eventsElement) {
        let currentEventIndex = 0;

        function rotateEvents() {
            eventsElement.textContent = specialEvents[currentEventIndex];
            currentEventIndex = (currentEventIndex + 1) % specialEvents.length;
        }

        rotateEvents();
        setInterval(rotateEvents, 5000); // Change every 5 seconds
    }
}

// Utility functions
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

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Initialize when page loads
window.addEventListener('load', function() {
    // Check URL hash and show appropriate section
    const hash = window.location.hash.substring(1);
    if (hash && ['home', 'dashboard', 'register', 'about'].includes(hash)) {
        showSection(hash);
    }
});

// Export functions for global access
window.showSection = showSection;
window.setViewMode = setViewMode;
window.shareBusinessWhatsApp = null;
window.viewBusinessProfile = null;