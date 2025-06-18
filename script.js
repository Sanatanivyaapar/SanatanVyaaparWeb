// Keval Sanatani Vyapar - Main JavaScript File

let currentViewMode = 'grid';
let allBusinesses = [];
let featuredBusinesses = [];
let businessData = [];

// Load data from static data file
function loadBusinessData() {
    try {
        // Get data from data.js
        businessData = window.businessDataService.getAllBusinesses();
        console.log('Loaded business data:', businessData);
        
        // Add event listeners for filters
        const searchInput = document.getElementById('search-input');
        const districtFilter = document.getElementById('district-filter');
        const categoryFilter = document.getElementById('category-filter');
        const pincodeFilter = document.getElementById('pincode-filter');

        if (searchInput) searchInput.addEventListener('input', searchAndFilter);
        if (districtFilter) districtFilter.addEventListener('change', searchAndFilter);
        if (categoryFilter) categoryFilter.addEventListener('change', searchAndFilter);
        if (pincodeFilter) pincodeFilter.addEventListener('input', searchAndFilter);

        // Initialize filters and display data
        initializeFilters();
        populateFilters(businessData);
        searchAndFilter();
        
    } catch (error) {
        console.error('Error loading business data:', error);
        showNotification('डेटा लोड करने में समस्या हुई', 'error');
    }
}

// Display business data
function displayBusinessData(data) {
    const container = document.getElementById('business-listings');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';

    // Create business cards
    data.forEach(row => {
        if (!row || row.length < 8) return;

        // Map form responses to variables
        const name = row[1] || ''; // Column B: Name
        const phone = row[2] || ''; // Column C: Phone
        const email = row[3] || ''; // Column D: Email
        const category = row[4] || ''; // Column E: Category
        const address = row[5] || ''; // Column F: Address
        const district = row[6] || ''; // Column G: District
        const pincode = row[7] || ''; // Column H: Pincode
        const description = row[8] || ''; // Column I: Description
        
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-6 mb-4';
        
        // Get current language
        const currentLang = document.querySelector('html').lang;
        let labels = {
            category: 'Category',
            district: 'District',
            pincode: 'Pincode',
            contact: 'Contact',
            address: 'Address'
        };

        if (currentLang === 'gu') {
            labels = {
                category: 'શ્રેણી',
                district: 'જિલ્લો',
                pincode: 'પિનકોડ',
                contact: 'સંપર્ક',
                address: 'સરનામું'
            };
        } else if (currentLang === 'hi') {
            labels = {
                category: 'श्रेणी',
                district: 'जिला',
                pincode: 'पिनकोड',
                contact: 'संपर्क',
                address: 'पता'
            };
        }
        
        card.innerHTML = `
            <h3 class="text-xl font-semibold mb-2">${name}</h3>
            ${description ? `<p class="text-gray-600 mb-4">${description}</p>` : ''}
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">${labels.category}:</p>
                    <p class="font-medium">${category}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">${labels.district}:</p>
                    <p class="font-medium">${district}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">${labels.address}:</p>
                    <p class="font-medium">${address}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">${labels.pincode}:</p>
                    <p class="font-medium">${pincode}</p>
                </div>
            </div>
            <div class="flex gap-4 mt-4">
                ${phone ? `<a href="tel:${phone}" class="flex items-center text-orange-600 hover:text-orange-700"><i class="fas fa-phone mr-2"></i>${phone}</a>` : ''}
                ${email ? `<a href="mailto:${email}" class="flex items-center text-blue-600 hover:text-blue-700"><i class="fas fa-envelope mr-2"></i>${email}</a>` : ''}
            </div>
        `;
        
        container.appendChild(card);
    });

    // Update results count
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        const currentLang = document.querySelector('html').lang;
        let text = '';
        if (currentLang === 'gu') {
            text = `${data.length} પરિણામો મળ્યા`;
        } else if (currentLang === 'hi') {
            text = `${data.length} परिणाम मिले`;
        } else {
            text = `${data.length} results found`;
        }
        resultsCount.textContent = text;
    }

    // Show no results message if needed
    const noResults = document.getElementById('no-results');
    if (noResults) {
        noResults.style.display = data.length === 0 ? 'block' : 'none';
    }

}

// Search and filter functionality
function searchAndFilter() {
    console.log('Searching and filtering...');
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const districtFilter = document.getElementById('district-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    const pincodeFilter = document.getElementById('pincode-filter').value;

    console.log('Filters:', { searchInput, districtFilter, categoryFilter, pincodeFilter });

    const filteredData = businessData.filter(row => {
        if (!row || row.length < 8) return false;

        // Map form responses to variables
        const name = row[1] || ''; // Column B: Name
        const phone = row[2] || ''; // Column C: Phone
        const email = row[3] || ''; // Column D: Email
        const category = row[4] || ''; // Column E: Category
        const address = row[5] || ''; // Column F: Address
        const district = row[6] || ''; // Column G: District
        const pincode = row[7] || ''; // Column H: Pincode
        const description = row[8] || ''; // Column I: Description

        // Filter conditions
        const matchesDistrict = !districtFilter || district.toLowerCase() === districtFilter.toLowerCase();
        const matchesCategory = !categoryFilter || category.toLowerCase() === categoryFilter.toLowerCase();
        const matchesPincode = !pincodeFilter || pincode.toString().includes(pincodeFilter);
        
        // Search in name, description, and address
        const matchesSearch = !searchInput || 
            name.toLowerCase().includes(searchInput) || 
            description.toLowerCase().includes(searchInput) || 
            address.toLowerCase().includes(searchInput);

        return matchesDistrict && matchesCategory && matchesPincode && matchesSearch;
    });

    // Sort results by district and category
    filteredData.sort((a, b) => {
        const districtA = a[6] || '';
        const districtB = b[6] || '';
        const categoryA = a[4] || '';
        const categoryB = b[4] || '';

        if (districtA !== districtB) {
            return districtA.localeCompare(districtB);
        }
        return categoryA.localeCompare(categoryB);
    });

    displayBusinessData(filteredData);

    // Update results count based on current language
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        const currentLang = document.querySelector('html').lang;
        let text = '';
        if (currentLang === 'gu') {
            text = `${filteredData.length} પરિણામો મળ્યા`;
        } else if (currentLang === 'hi') {
            text = `${filteredData.length} परिणाम मिले`;
        } else {
            text = `${filteredData.length} results found`;
        }
        resultsCount.textContent = text;
    }

    // Show/hide no results message
    const noResults = document.getElementById('no-results');
    if (noResults) {
        if (filteredData.length === 0) {
            const currentLang = document.querySelector('html').lang;
            let text = '';
            if (currentLang === 'gu') {
                text = 'કોઈ પરિણામ મળ્યા નથી';
            } else if (currentLang === 'hi') {
                text = 'कोई परिणाम नहीं मिला';
            } else {
                text = 'No results found';
            }
            noResults.textContent = text;
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
    }
}

// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        loadBusinessData();
        initializeApp();
        initializeSearch();
        initializeLanguageSelector();
        initializePanchang();
        setupNavigation();
        
        // Add search and filter event listeners
        const searchInput = document.getElementById('search-input');
        const districtFilter = document.getElementById('district-filter');
        const categoryFilter = document.getElementById('category-filter');
        const pincodeFilter = document.getElementById('pincode-filter');

        [searchInput, districtFilter, categoryFilter, pincodeFilter].forEach(element => {
            if (element) {
                element.addEventListener('input', searchAndFilter);
            }
        });
        
        // Update Hindu time every second
        setInterval(updateHinduTime, 1000);

        // Update Panchang data
        updatePanchangData();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showNotification('एप्लिकेशन लोड करने में समस्या हुई', 'error');
    }
});

// Language switching functionality
function initializeLanguageSelector() {
    const languageSelector = document.getElementById('language-selector');
    const mobileLanguageSelector = document.getElementById('mobile-language-selector');

    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            switchLanguage(this.value);
            // Sync mobile selector
            if (mobileLanguageSelector) {
                mobileLanguageSelector.value = this.value;
            }
        });
    }

    if (mobileLanguageSelector) {
        mobileLanguageSelector.addEventListener('change', function() {
            switchLanguage(this.value);
            // Sync desktop selector
            if (languageSelector) {
                languageSelector.value = this.value;
            }
        });
    }

    // Load saved language preference or set default
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'hindi';
    if (languageSelector) {
        languageSelector.value = savedLanguage;
    }
    if (mobileLanguageSelector) {
        mobileLanguageSelector.value = savedLanguage;
    }
    switchLanguage(savedLanguage);
}

function switchLanguage(lang) {
    // Update HTML lang attribute
    const langMap = {
        'gujarati': 'gu',
        'hindi': 'hi',
        'english': 'en'
    };
    document.querySelector('html').lang = langMap[lang];

    // Hide all language elements
    document.querySelectorAll('.gujarati-text, .hindi-text, .english-text').forEach(el => {
        el.style.display = 'none';
    });

    // Show selected language elements
    document.querySelectorAll('.' + lang + '-text').forEach(el => {
        el.style.display = 'inline-block';
    });

    // Update search button text
    const searchBtn = document.querySelector('button[onclick="searchAndFilter()"]');
    if (searchBtn) {
        searchBtn.querySelectorAll('span').forEach(span => {
            span.style.display = 'none';
        });
        searchBtn.querySelector('.' + lang + '-text').style.display = 'inline-block';
    }

    // Update search results count
    searchAndFilter();

    // Update select elements for the chosen language
    document.querySelectorAll('select').forEach(select => {
        Array.from(select.options).forEach(option => {
            if (option.classList.contains(lang + '-text')) {
                option.style.display = 'block';
            } else {
                option.style.display = 'none';
            }
        });
        // Select first visible option
        const visibleOptions = Array.from(select.options).filter(opt => opt.style.display !== 'none');
        if (visibleOptions.length > 0) {
            select.value = visibleOptions[0].value;
        }
    });

    // Update page direction and language attribute
    if (language === 'gujarati') {
        document.documentElement.setAttribute('lang', 'gu');
    } else if (language === 'hindi') {
        document.documentElement.setAttribute('lang', 'hi');
    } else {
        document.documentElement.setAttribute('lang', 'en');
    }

    // Save language preference
    localStorage.setItem('selectedLanguage', language);
}

// Advanced Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const districtFilter = document.getElementById('district-filter');
    const categoryFilter = document.getElementById('category-filter');
    const pincodeFilter = document.getElementById('pincode-filter');

    if (searchInput) {
        // Update placeholder based on language
        updateSearchPlaceholders();

        // Debounced search
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch();
            }, 300);
        });
    }

    if (pincodeFilter) {
        // Add pincode suggestions
        const gujaratPincodes = [
            '380001', '380002', '380003', '380004', '380005', '380006', '380007', '380008', '380009', '380013', '380015', '380016', '380018', '380019', '380021', '380022', '380024', '380025', '380026', '380027', '380028', '380050', '380051', '380052', '380053', '380054', '380055', '380060', '380061', '380063',
            '395001', '395002', '395003', '395004', '395005', '395006', '395007', '395008', '395009', '395010', '395017', '394101', '394102', '394103', '394107', '394110', '394210', '394215', '394220', '394230', '394235', '394240', '394245', '394248', '394305', '394310', '394315', '394320', '394325', '394327',
            '390001', '390002', '390003', '390004', '390005', '390006', '390007', '390008', '390009', '390010', '390011', '390012', '390013', '390014', '390015', '390016', '390017', '390018', '390019', '390020', '390021', '390022', '390023', '391101', '391102', '391110', '391115', '391120', '391125', '391135',
            '361001', '361002', '361004', '361005', '361006', '361008', '361010', '361011', '361012', '361013', '361014', '361015', '361016', '361020', '361030', '361035', '361140', '361141', '361142', '361160', '361170', '361305', '361335', '361345', '361350', '361345', '361360', '361370', '361280', '361290',
            '360001', '360002', '360003', '360004', '360005', '360006', '360007', '360009', '360010', '360011', '360020', '360021', '360022', '360023', '360024', '360025', '360110', '360311', '360370', '360410', '360440', '360450', '360480', '360490', '360510', '360515', '360520', '360530', '360540', '360550'
        ];

        pincodeFilter.addEventListener('input', function() {
            const value = this.value;
            if (value.length >= 2) {
                // Show matching pincodes
                console.log('Pincode suggestions for:', value);
            }
            performSearch();
        });
    }

    // Filter change handlers
    [districtFilter, categoryFilter, pincodeFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', performSearch);
        }
    });

    // Initialize filters with data
    populateFilters();
}

function updateSearchPlaceholders() {
    const searchInput = document.getElementById('search-input');
    const pincodeFilter = document.getElementById('pincode-filter');
    const currentLanguage = document.getElementById('language-selector')?.value || 'hindi';

    if (searchInput) {
        const placeholders = {
            gujarati: 'વ્યાપાર અથવા માલિકનું નામ શોધો',
            hindi: 'व्यापार या मालिक का नाम खोजें',
            english: 'Search business or owner name'
        };
        searchInput.placeholder = placeholders[currentLanguage];
    }

    if (pincodeFilter) {
        const placeholders = {
            gujarati: 'પિનકોડ',
            hindi: 'पिनकोड',
            english: 'Pincode'
        };
        pincodeFilter.placeholder = placeholders[currentLanguage];
    }
}

function performSearch() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const selectedDistrict = document.getElementById('district-filter')?.value || '';
    const selectedCategory = document.getElementById('category-filter')?.value || '';
    const selectedPincode = document.getElementById('pincode-filter')?.value || '';

    const businessCards = document.querySelectorAll('.business-card, [data-business]');
    let visibleCount = 0;

    businessCards.forEach(card => {
        const businessName = card.querySelector('.business-name, h4')?.textContent.toLowerCase() || '';
        const ownerName = card.querySelector('.owner-name, .business-owner')?.textContent.toLowerCase() || '';
        const district = card.dataset.district || '';
        const category = card.dataset.category || '';
        const pincode = card.dataset.pincode || '';
        const description = card.querySelector('.business-description, p')?.textContent.toLowerCase() || '';

        // Search in business name, owner name, and description
        const matchesSearch = !searchTerm || 
            businessName.includes(searchTerm) || 
            ownerName.includes(searchTerm) || 
            description.includes(searchTerm);

        // Filter matches
        const matchesDistrict = !selectedDistrict || district === selectedDistrict;
        const matchesCategory = !selectedCategory || category === selectedCategory;
        const matchesPincode = !selectedPincode || pincode.includes(selectedPincode);

        const isVisible = matchesSearch && matchesDistrict && matchesCategory && matchesPincode;

        if (isVisible) {
            card.style.display = 'block';
            card.classList.add('search-result');
            visibleCount++;

            // Highlight search terms
            if (searchTerm) {
                highlightSearchTerm(card, searchTerm);
            } else {
                removeHighlights(card);
            }
        } else {
            card.style.display = 'none';
            card.classList.remove('search-result');
        }
    });

    // Update results count
    updateResultsCount(visibleCount);

    // Show/hide no results message
    toggleNoResults(visibleCount === 0);
}

function highlightSearchTerm(element, term) {
    const textElements = element.querySelectorAll('h4, p, .business-name, .owner-name');
    textElements.forEach(el => {
        const originalText = el.dataset.originalText || el.textContent;
        if (!el.dataset.originalText) {
            el.dataset.originalText = originalText;
        }

        const regex = new RegExp(`(${term})`, 'gi');
        const highlightedText = originalText.replace(regex, '<mark style="background-color: #fbbf24; padding: 2px 4px; border-radius: 3px;">$1</mark>');
        el.innerHTML = highlightedText;
    });
}

function removeHighlights(element) {
    const textElements = element.querySelectorAll('h4, p, .business-name, .owner-name');
    textElements.forEach(el => {
        if (el.dataset.originalText) {
            el.textContent = el.dataset.originalText;
        }
    });
}

function populateFilters(data) {
    // This will be called after businesses are loaded
    const districtFilter = document.getElementById('district-filter');
    const categoryFilter = document.getElementById('category-filter');
    const pincodeFilter = document.getElementById('pincode-filter'); // Added pincode filter

    if (districtFilter) {
        // All districts of Gujarat with their common pincodes
        const gujaratDistricts = [
            'અમદાવાદ (Ahmedabad)', 'અમરેલી (Amreli)', 'આણંદ (Anand)', 'અરાવલ્લી (Aravalli)',
            'બનાસકાંઠા (Banaskantha)', 'ભરૂચ (Bharuch)', 'ભાવનગર (Bhavnagar)', 'બોટાદ (Botad)',
            'છોટાઉદેપુર (Chhota Udaipur)', 'દાહોદ (Dahod)', 'દંગ (Dang)', 'દેવભૂમિ દ્વારકા (Devbhoomi Dwarka)',
            'ગાંધીનગર (Gandhinagar)', 'ગીર સોમનાથ (Gir Somnath)', 'જામનગર (Jamnagar)', 'જૂનાગઢ (Junagadh)',
            'કચ્છ (Kutch)', 'ખેડા (Kheda)', 'મહિસાગર (Mahisagar)', 'મહેસાણા (Mehsana)',
            'મોરબી (Morbi)', 'નર્મદા (Narmada)', 'નવસારી (Navsari)', 'પાંચમહાલ (Panchmahal)',
            'પાટણ (Patan)', 'પોરબંદર (Porbandar)', 'રાજકોટ (Rajkot)', 'સાબરકાંઠા (Sabarkantha)',
            'સુરત (Surat)', 'સુરેન્દ્રનગર (Surendranagar)', 'તાપી (Tapi)', 'વડોદરા (Vadodara)', 'વલસાડ (Valsad)'
        ];

        gujaratDistricts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtFilter.appendChild(option);
        });
    }

    if (categoryFilter) {
        // Categories from Google Form (same as provided in images)
        const categories = [
            'ફળ / શાકભાજી વિક્રેતા (Fruit / Vegetable Vendor)',
            'ચા / નાસ્તાની સ્ટોલ (Tea / Breakfast Stall)',
            'કિરાણા સ્ટોર (Grocery Shop)',
            'કપડાની દુકાન (Clothing Store)',
            'જૂતા / ચપ્પલ વિક્રેતા (Footwear Shop)',
            'રેડીમેડ ગારમેન્ટ્સ (Readymade Garments)',
            'ઓટો ગેરેજ / મિકેનિક (Auto Garage / Mechanic)',
            'ઇલેક્ટ્રિશિયન / પ્લમ્બર (Electrician / Plumber)',
            'બ્યુટી પાર્લર / સલૂન (Salon / Parlour)',
            'ફાર્મસી / મેડિકલ સ્ટોર (Pharmacy / Medical Store)',
            'ક્લિનિક / ડોક્ટર (Clinic / Doctor)',
            'હોસ્પિટલ / નર્સિંગ હોમ (Hospital / Nursing Home)',
            'ઇવેન્ટ પ્લાનર / ડેકોરેટર (Event Planner / Decorator)',
            'ફોટોગ્રાફર / વિડિયોગ્રાફર (Photographer / Videographer)',
            'પ્રિન્ટર / ડિઝાઇનર (Printer / Designer)',
            'ફર્નીચર વ્યવસાય (Furniture Business)',
            'ઇલેક્ટ્રોનિક્સ સ્ટોર (Electronics Store)',
            'CA / જ્યોતિષ (Tax Consultant)',
            'શિક્ષક / કોચિંગ ક્લાસ (Teacher / Coaching)',
            'કૃષિ વ્યવસાય / બીજ-ઉર્વરક વિતરણ',
            'બિલ્ડર / કોન્ટ્રાક્ટર (Builder / Contractor)',
            'ટ્રાન્સપોર્ટ / ટ્રક વ્યવસાય',
            'મેન્યુફેક્ચરર / ઉદ્યોગપતિ (Manufacturer / Industrialist)',
            'ઓનલાઇન વ્યવસાય / ડિજિટલ માર્કેટર',
            'NGO / સામાજિક સંસ્થા',
            'ફ્રીલાન્સર / સોફ્ટવેર ડેવલપર',
            'વેબ ડિઝાઇનર / IT સેવાઓ',
            'હૉકર / સ્ટ્રીટ વેન્ડર (Hawker / Street Vendor)',
            'રેસ્ટોરન્ટ / હોટેલ (Restaurant / Hotel)',
            'બેકરી / મિઠાઇ (Bakery / Sweet Shop)',
            'ડેરી / દૂધ બૂથ (Dairy / Milk Booth)',
            'ઓટો રિપેર / ગેરેજ (Auto Repair / Garage)',
            'યોગ / ફિટનેસ ઇન્સ્ટ્રક્ટર (Yoga / Fitness Instructor)',
            'આયુર્વેદ / પંચકર્મ સેન્ટર (Ayurveda / Panchkarma Center)',
            'ડોક્ટર / ફિઝિશિયન (Doctor / Physician)',
            'ક્લિનિક / હોસ્પિટલ / નર્સિંગ હોમ',
            'ફાર્મસી / મેડિકલ શોપ (Pharmacy / Medical Shop)',
            'પેથોલોજી / લેબ સેન્ટર (Pathology / Diagnostic Lab)',
            'લોન્ડ્રી / ડ્રાય ક્લિનિંગ (Laundry / Dry Cleaning)',
            'પેઇન્ટર / કલર વર્ક (Painter / Color Work)',
            'સાયબર કેફે / ફોટોકોપી / સ્ટેશનરી',
            'કોમ્પ્યુટર / લેપટોપ સ્ટોર (Computer / Laptop Store)',
            'ગ્રાફિક્સ ડિઝાઇનર / DTP (Graphic / Web Designer / DTP)',
            'CA / એકાઉન્ટન્ટ / ટેક્સ કન્સલ્ટન્ટ',
            'વકીલ / લો ઓફિસ (Lawyer / Legal Service)',
            'જમીન એજન્ટ / બિલ્ડર (Land Agent / Builder)',
            'કન્સ્ટ્રક્શન મટિરિયલ સપ્લાયર (Construction Material Supplier)',
            'ખેતી / ખેતીના ઉપકરણો વિક્રેતા (Agricultural Equipments Seller)',
            'બીજ / ખાતર વિક્રેતા (Seed / Fertilizer Seller)',
            'ટ્રાન્સપોર્ટ સેવા / લોડિંગ સેવા (Transport / Loading Service)',
            'ટ્રાવેલ એજન્ટ / ટિકિટ બુકિંગ (Travel Agent / Ticket Booking)',
            'ઓનલાઇન વ્યવસાય / ઇ-કોમર્સ વિક્રેતા',
            'ફ્રીલાન્સર / સોફ્ટવેર ડેવલપર (Freelancer / Software Developer)',
            'સોશ્યલ મીડિયા માર્કેટર / એડ એક્સપર્ટ',
            'MSME / લઘુ ઉદ્યોગ (Small Scale Manufacturer / MSME)',
            'કુટીર ઉદ્યોગ / હસ્તકલા કામ (Cottage Industry / Hand made Crafts)',
            'આગરબત્તી / મીણબત્તી બનાવનાર (Incense Stick / Candle Maker)',
            'હસ્તકલા વ્યાપારી (Handicraft Seller)',
            'NGO / સામાજીક સેવા સંસ્થા (NGO / Social Welfare Group)',
            'પુસ્તક વિક્રેતા / શિક્ષણ સામગ્રી (Books / Education Material Seller)',
            'રમત સામગ્રી વિક્રેતા (Sports Goods Seller)',
            'જિમ / ફિટનેસ સેન્ટર (Gym / Fitness Center)',
            'ઇન્ટેરિયર ડેકોરેટર (Interior Decorator)',
            'રંગરોગન / POP કાર્ય (POP / Painting Worker)',
            'સિક્યોરિટી / પ્રાઈવેટ સિક્યોરિટી સર્વિસ (CCTV / Security Services)',
            'કુરિયર સર્વિસ / ડિલિવરી પાર્ટનર (Courier Agency / Delivery Partner)',
            'ત્યોહાર / મેળા બજારમાં કામ કરનાર (Festival Product Maker)',
            'જથ્થાબંધ વિક્રેતા (Wholesaler)',
            'રિટેલ વિક્રેતા (Retailer)',
            'હોમ બેસ્ડ બિઝનેસ (Home Based Business)',
            'લેખક / સંપાદક / પત્રકાર (Writer / Editor / Journalist)'
        ];

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    if (pincodeFilter) {
        // Add pincode suggestions
        const gujaratPincodes = [
            '380001', '380002', '380003', '380004', '380005', '380006', '380007', '380008', '380009', '380013', '380015', '380016', '380018', '380019', '380021', '380022', '380024', '380025', '380026', '380027', '380028', '380050', '380051', '380052', '380053', '380054', '380055', '380060', '380061', '380063',
            '395001', '395002', '395003', '395004', '395005', '395006', '395007', '395008', '395009', '395010', '395017', '394101', '394102', '394103', '394107', '394110', '394210', '394215', '394220', '394230', '394235', '394240', '394245', '394248', '394305', '394310', '394315', '394320', '394325', '394327',
            '390001', '390002', '390003', '390004', '390005', '390006', '390007', '390008', '390009', '390010', '390011', '390012', '390013', '390014', '390015', '390016', '390017', '390018', '390019', '390020', '390021', '390022', '390023', '391101', '391102', '391110', '391115', '391120', '391125', '391135',
            '361001', '361002', '361004', '361005', '361006', '361008', '361010', '361011', '361012', '361013', '361014', '361015', '361016', '361020', '361030', '361035', '361140', '361141', '361142', '361160', '361170', '361305', '361335', '361345', '361350', '361345', '361360', '361370', '361280', '361290',
            '360001', '360002', '360003', '360004', '360005', '360006', '360007', '360009', '360010', '360011', '360020', '360021', '360022', '360023', '360024', '360025', '360110', '360311', '360370', '360410', '360440', '360450', '360480', '360490', '360510', '360515', '360520', '360530', '360540', '360550'
        ];

        // Populate pincode filter - all pincodes from Gujarat
        gujaratPincodes.forEach(pincode => {
            const option = document.createElement('option');
            option.value = pincode;
            option.textContent = pincode;
            pincodeFilter.appendChild(option);
        });
    }
}

function updateResultsCount(count) {
    const countElement = document.getElementById('business-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

function toggleNoResults(show) {
    const noResultsElement = document.getElementById('no-results');
    if (noResultsElement) {
        noResultsElement.style.display = show ? 'block' : 'none';
    }
}

function initializeApp() {
    setupNavigation();
    loadBusinessesFromDatabase();
    setupEventListeners();
    setupFormValidation();
    initializePanchang();
}

// Panchang and Hindu Calendar Functions
function initializePanchang() {
    // Start updating Panchang data
    updatePanchangData();
    setInterval(updatePanchangData, 60000); // Update every minute
    
    // Start updating Hindu time
    updateHinduTime();
    updatePanchangData();
    updateSunTimes();
    updateSpecialEvents();

    // Update time every minute
    setInterval(updateHinduTime, 60000);

    // Update panchang data once a day
    setInterval(updatePanchangData, 24 * 60 * 60 * 1000);

    // Update sun times once per hour
    setInterval(updateSunTimes, 60 * 60 * 1000);
}

// Special event handling for dashboard
function handleDashboardSection() {
    displayBusinesses();
    displayFeaturedBusinesses();
}

function updatePanchangData() {
    // Get current date
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

    document.getElementById('tithiText').textContent = `${currentTithi} (${paksha})`;

    // Calculate sunrise and sunset for Surat location (approximate)
    updateSunTimes();
}

function updateHinduTime() {
    const now = new Date();

    // Convert to IST if needed
    const istOffset = 5.5 * 60; // IST is UTC+5:30
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utc + (istOffset * 60000));

    // Calculate ghati, pal, vipal
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const seconds = istTime.getSeconds();

    // 1 day = 60 ghati, 1 ghati = 60 pal, 1 pal = 60 vipal
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    const totalGhatiSeconds = 24 * 60 * 60 / 60; // seconds per ghati

    const ghati = Math.floor(totalSeconds / totalGhatiSeconds);
    const remainingSeconds = totalSeconds % totalGhatiSeconds;
    const pal = Math.floor(remainingSeconds / (totalGhatiSeconds / 60));
    const vipal = Math.floor((remainingSeconds % (totalGhatiSeconds / 60)) / (totalGhatiSeconds / 3600));

    document.getElementById('hinduTimeText').textContent = `${ghati}:${pal.toString().padStart(2, '0')}:${vipal.toString().padStart(2, '0')}`;
}

function updateSunTimes() {
    // Approximate sunrise and sunset for Surat, Gujarat
    // This is a simplified calculation - in real implementation, you'd use an astronomy API
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    // Approximate times for Surat (21.1702° N, 72.8311° E)
    const baserise = 6.5; // Base sunrise hour
    const baseset = 18.5; // Base sunset hour

    // Simple seasonal variation
    const seasonalVar = Math.sin((dayOfYear - 81) * 2 * Math.PI / 365) * 1.2;

    const sunriseHour = baserise - seasonalVar;
    const sunsetHour = baseset + seasonalVar;

    const sunriseMinutes = Math.floor((sunriseHour % 1) * 60);
    const sunsetMinutes = Math.floor((sunsetHour % 1) * 60);

    document.getElementById('sunriseTime').textContent = 
        `${Math.floor(sunriseHour)}:${sunriseMinutes.toString().padStart(2, '0')}`;
    document.getElementById('sunsetTime').textContent = 
        `${Math.floor(sunsetHour)}:${sunsetMinutes.toString().padStart(2, '0')}`;
}

// Navigation Functions
function setupNavigation() {
    // Handle navigation clicks
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

function showSection(sectionId) {
    // Hide all sections
    const sections = ['home', 'dashboard', 'register', 'about'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            if (section === sectionId) {
                element.classList.remove('hidden');
                element.classList.add('fade-in');
            } else {
                element.classList.add('hidden');
                element.classList.remove('fade-in');
            }
        }
    });

    // Update active state in navigation
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('text-orange-600');
            link.classList.remove('text-gray-700');
        } else {
            link.classList.remove('text-orange-600');
            link.classList.add('text-gray-700');
        }
    });

    // Special handling for dashboard section
    if (sectionId === 'dashboard') {
        handleDashboardSection();
    }

    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Call initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Load businesses from database
async function loadBusinessesFromDatabase() {
    try {
        const response = await fetch('/api/businesses');
        if (response.ok) {
            const data = await response.json();
            allBusinesses = data.businesses || [];
            featuredBusinesses = allBusinesses.filter(business => business.featured);

            // Populate filter options
            populateFilterOptions();

            // Display businesses if dashboard is visible
            const dashboard = document.getElementById('dashboard');
            if (dashboard && !dashboard.classList.contains('hidden')) {
                displayBusinesses();
                displayFeaturedBusinesses();
            }
        }
    } catch (error) {
        console.error('Error loading businesses:', error);
    }
}

// Filter businesses based on search term, district, category, and pincode
function filterBusinesses() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedDistrict = districtFilter.value;
    const selectedCategory = categoryFilter.value;
    const selectedPincode = pincodeFilter.value;

    const filteredBusinesses = allBusinesses.filter(business => {
        const Name = business.business_name.toLowerCase();
        const ownerName = business.owner_name.toLowerCase();
        const description = business.description.toLowerCase();

        const matchesSearch = Name.includes(searchTerm) ||
                            ownerName.includes(searchTerm) ||
                            description.includes(searchTerm);

        const matchesDistrict = !selectedDistrict || business.district === selectedDistrict;
        const matchesCategory = !selectedCategory || business.category === selectedCategory;
        const matchesPincode = !selectedPincode || business.pincode.includes(selectedPincode);

        return matchesSearch && matchesDistrict && matchesCategory && matchesPincode;
    });

    displayBusinesses(filteredBusinesses);
}

// Display businesses in current view mode
function displayBusinesses(businesses = allBusinesses) {
    const businessGrid = document.getElementById('business-grid');
    const businessList = document.getElementById('business-list');
    const businessCount = document.getElementById('business-count');
    const noResults = document.getElementById('no-results');

    if (!businessGrid || !businessList || !businessCount) return;

    // Update count
    businessCount.textContent = businesses.length;

    // Show/hide no results message
    if (businesses.length === 0) {
        noResults?.classList.remove('hidden');
        businessGrid.classList.add('hidden');
        businessList.classList.add('hidden');
        return;
    } else {
        noResults?.classList.add('hidden');
    }

    // Clear previous content
    businessGrid.innerHTML = '';
    businessList.innerHTML = '';

    if (currentViewMode === 'grid') {
        businessGrid.classList.remove('hidden');
        businessList.classList.add('hidden');

        businesses.forEach(business => {
            businessGrid.appendChild(createBusinessCard(business));
        });
    } else {
        businessGrid.classList.add('hidden');
        businessList.classList.remove('hidden');

        businesses.forEach(business => {
            businessList.appendChild(createBusinessListItem(business));
        });
    }
}

// HTML escape function to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Create business card for grid view
function createBusinessCard(business) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300';

    card.innerHTML = `
        <div class="relative">
            ${business.business_image ? 
                `<img src="${escapeHtml(business.business_image)}" alt="${escapeHtml(business.business_name)}" class="w-full h-48 object-cover">` :
                `<div class="w-full h-48 bg-orange-100 flex items-center justify-center">
                    <i class="fas fa-store text-4xl text-orange-500"></i>
                </div>`
            }
            ${business.featured ? '<div class="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">विशेष</div>' : ''}
        </div>

        <div class="p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-2 hindi-font">${escapeHtml(business.business_name)}</h3>
            <p class="text-gray-600 mb-2 hindi-font">${escapeHtml(business.owner_name)}</p>
            <div class="flex items-center mb-2">
                <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm hindi-font">${escapeHtml(business.category)}</span>
                <span class="ml-2 text-gray-500 text-sm">${escapeHtml(business.district)}</span>
            </div>

            <p class="text-gray-600 text-sm mb-4 hindi-font line-clamp-2">${escapeHtml(business.description || 'विवरण उपलब्ध नहीं')}</p>

            <div class="flex items-center justify-between mb-4">
                <span class="text-gray-500 text-sm">${escapeHtml(business.pincode)}</span>
                <span class="text-xs text-gray-400">ID: ${escapeHtml(business.sanatani_id)}</span>
            </div>

            <div class="flex gap-2">
                ${business.whatsapp ? 
                    `<a href="https://wa.me/91${escapeHtml(business.whatsapp)}" target="_blank" class="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-center text-sm hover:bg-green-600 transition-colors">
                        <i class="fab fa-whatsapp mr-1"></i>WhatsApp
                    </a>` : ''
                }
                <button onclick="shareBusinessWhatsApp('${escapeHtml(business.sanatani_id)}')" class="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                    <i class="fas fa-share"></i>
                </button>
                <button onclick="viewBusinessProfile('${escapeHtml(business.sanatani_id)}')" class="bg-orange-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
    `;

    return card;
}

// Create business list item for list view
function createBusinessListItem(business) {
    const listItem = document.createElement('div');
    listItem.className = 'bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto';

    listItem.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6">
            <div class="md:w-32 h-32 flex-shrink-0">
                ${business.business_image ? 
                    `<img src="${business.business_image}" alt="${business.business_name}" class="w-full h-full object-cover rounded-lg">` :
                    `<div class="w-full h-full bg-orange-100 flex items-center justify-center rounded-lg">
                        <i class="fas fa-store text-2xl text-orange-500"></i>
                    </div>`
                }
            </div>

            <div class="flex-1">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 hindi-font">${business.business_name}</h2>
                        <p class="text-lg text-gray-600 hindi-font">${business.owner_name}</p>
                    </div>
                    ${business.featured ? '<span class="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">विशेष व्यापार</span>' : ''}
                </div>

                <div class="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <h3 class="font-semibold text-gray-800 mb-2 hindi-font">व्यापार विवरण</h3>
                        <p class="text-sm text-gray-600 hindi-font">प्रकार: ${business.business_type}</p>
                        <p class="text-sm text-gray-600 hindi-font">श्रेणी: ${business.category}</p>
                        <p class="text-sm text-gray-600">ID: ${business.sanatani_id}</p>
                    </div>

                    <div>
                        <h3 class="font-semibold text-gray-800 mb-2 hindi-font">स्थान की जानकारी</h3>
                        <p class="text-sm text-gray-600">${business.district}, ${business.state}</p>
                        <p class="text-sm text-gray-600">पिनकोड: ${business.pincode}</p>
                    </div>
                </div>

                ${business.address ? `
                    <div class="mb-6">
                        <h3 class="font-semibold text-gray-800 mb-2 hindi-font">पूरा पता</h3>
                        <p class="text-gray-600 hindi-font">${business.address}</p>
                    </div>
                ` : ''}

                ${business.description ? `
                    <div class="mb-6">
                        <h3 class="font-semibold text-gray-800 mb-2 hindi-font">विवरण</h3>
                        <p class="text-gray-600 hindi-font">${business.description}</p>
                    </div>
                ` : ''}

                <div class="border-t pt-6">
                    <h3 class="font-semibold text-gray-800 mb-4 hindi-font">संपर्क करें</h3>
                    <div class="flex flex-wrap gap-3">
                        ${business.whatsapp ? 
                            `<a href="https://wa.me/91${business.whatsapp}" target="_blank" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                <i class="fab fa-whatsapp mr-2"></i>WhatsApp
                            </a>` : ''
                        }

                        ${business.phone ? 
                            `<a href="tel:+91${business.phone}" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                <i class="fas fa-phone mr-2"></i>कॉल करें
                            </a>` : ''
                        }

                        ${business.email ? 
                            `<a href="mailto:${business.email}" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                                <i class="fas fa-envelope mr-2"></i>ईमेल
                            </a>` : ''
                        }

                        ${business.website ? 
                            `<a href="${business.website}" target="_blank" class="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                                <i class="fas fa-globe mr-2"></i>वेबसाइट
                            </a>` : ''
                        }

                        <button onclick="shareBusinessWhatsApp('${business.sanatani_id}')" class="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                            <i class="fas fa-share mr-2"></i>शेयर करें
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    return listItem;
}

// Display featured businesses
function displayFeaturedBusinesses() {
    const featuredContainer = document.getElementById('featured-businesses');
    if (!featuredContainer || featuredBusinesses.length === 0) return;

    // Shuffle and take first 3
    const shuffled = [...featuredBusinesses].sort(() => 0.5 - Math.random());
    const selectedFeatured = shuffled.slice(0, 3);

    featuredContainer.innerHTML = '';

    selectedFeatured.forEach(business => {
        const featuredCard = document.createElement('div');
        featuredCard.className = 'bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center';

        featuredCard.innerHTML = `
            <div class="text-2xl mb-2">🏪</div>
            <h4 class="font-semibold mb-1 hindi-font">${business.business_name}</h4>
            <p class="text-sm opacity-90 hindi-font">${business.category} • ${business.district}</p>
            <button onclick="viewBusinessProfile('${business.sanatani_id}')" class="mt-2 bg-white text-orange-600 px-3 py-1 rounded text-sm hover:bg-gray-100 transition-colors">
                देखें
            </button>
        `;

        featuredContainer.appendChild(featuredCard);
    });
}

// Set view mode (grid/list)
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

// Share business on WhatsApp
function shareBusinessWhatsApp(sanataniId) {
    const business = allBusinesses.find(b => b.sanatani_id === sanataniId);
    if (!business) return;

    const shareText = `🕉️ केवल सनातनी व्यापार

${business.business_name}
मालिक: ${business.owner_name}
श्रेणी: ${business.category}
स्थान: ${business.district}, ${business.state}

${business.description || ''}

ID: ${business.sanatani_id}

WhatsApp पर संपर्क करें और अधिक जानकारी पाएं!
#KevalSanataniVyapar #SanataniBusinessNetwork`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
}

// View business profile
function viewBusinessProfile(sanataniId) {
    const business = allBusinesses.find(b => b.sanatani_id === sanataniId);
    if (!business) return;

    // Create modal for business profile
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };

    modal.innerHTML = `
        <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="relative">
                ${business.business_image ? 
                    `<img src="${business.business_image}" alt="${business.business_name}" class="w-full h-64 object-cover rounded-t-xl">` :
                    `<div class="w-full h-64 bg-orange-100 flex items-center justify-center rounded-t-xl">
                        <i class="fas fa-store text-6xl text-orange-500"></i>
                    </div>`
                }
                <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100">
                    <i class="fas fa-times text-gray-600"></i>
                </button>
            </div>

            <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 hindi-font">${business.business_name}</h2>
                        <p class="text-lg text-gray-600 hindi-font">${business.owner_name}</p>
                    </div>
                    ${business.featured ? '<span class="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">विशेष व्यापार</span>' : ''}
                </div>

                <div class="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <h3 class="font-semibold text-gray-800 mb-2 hindi-font">व्यापार विवरण</h3>
                        <p class="text-sm text-gray-600 hindi-font">प्रकार: ${business.business_type}</p>
                        <p class="text-sm text-gray-600 hindi-font">श्रेणी: ${business.category}</p>
                        <p class="text-sm text-gray-600">ID: ${business.sanatani_id}</p>
                    </div>

                    <div>
                        <h3 class="font-semibold text-gray-800 mb-2 hindi-font">स्थान की जानकारी</h3>
                        <p class="text-sm text-gray-600">${business.district}, ${business.state}</p>
                        <p class="text-sm text-gray-600">पिनकोड: ${business.pincode}</p>
                    </div>
                </div>

                ${business.address ? `
                    <div class="mb-6">
                        <h3 class="font-semibold text-gray-800 mb-2 hindi-font">पूरा पता</h3>
                        <p class="text-gray-600 hindi-font">${business.address}</p>
                    </div>
                ` : ''}

                ${business.description ? `
                    <div class="mb-6">
                        <h3 class="font-semibold text-gray-800 mb-2 hindi-font">विवरण</h3>
                        <p class="text-gray-600 hindi-font">${business.description}</p>
                    </div>
                ` : ''}

                <div class="border-t pt-6">
                    <h3 class="font-semibold text-gray-800 mb-4 hindi-font">संपर्क करें</h3>
                    <div class="flex flex-wrap gap-3">
                        ${business.whatsapp ? 
                            `<a href="https://wa.me/91${business.whatsapp}" target="_blank" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                <i class="fab fa-whatsapp mr-2"></i>WhatsApp
                            </a>` : ''
                        }

                        ${business.phone ? 
                            `<a href="tel:+91${business.phone}" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                <i class="fas fa-phone mr-2"></i>कॉल करें
                            </a>` : ''
                        }

                        ${business.email ? 
                            `<a href="mailto:${business.email}" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                                <i class="fas fa-envelope mr-2"></i>ईमेल
                            </a>` : ''
                        }

                        ${business.website ? 
                            `<a href="${business.website}" target="_blank" class="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                                <i class="fas fa-globe mr-2"></i>वेबसाइट
                            </a>` : ''
                        }

                        <button onclick="shareBusinessWhatsApp('${business.sanatani_id}')" class="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                            <i class="fas fa-share mr-2"></i>शेयर करें
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Form validation and submission
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
            const response = await fetch('/api/businesses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(businessData)
            });

            if (response.ok) {
                showNotification('आपका व्यापार सफलतापूर्वक पंजीकृत हो गया! सत्यापन के बाद यह दिखेगा।', 'success');
                form.reset();
                showSection('home');
            } else {
                const error = await response.json();
                showNotification(error.message || 'पंजीकरण में समस्या हुई', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('सर्वर से कनेक्शन में समस्या', 'error');
        }
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Google Sheets Integration Functions
async function syncWithGoogleSheets() {
    // This function can be used to sync with Google Sheets API
    // For now, we're using the database
    console.log('Google Sheets sync would happen here');
}

// Redirect to Google Form
function redirectToGoogleForm() {
    window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSdE3kVjS_o42jsoEg23Wy4-wQqBZBqVKgpFAK5IuJX1-LizXw/viewform?usp=header';
}

// Export functions for global access
window.showSection = showSection;
window.setViewMode = setViewMode;
window.shareBusinessWhatsApp = shareBusinessWhatsApp;
window.viewBusinessProfile = viewBusinessProfile;