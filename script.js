// Keval Sanatani Vyapar - Main JavaScript File

let currentViewMode = 'grid';
let allBusinesses = [];
let featuredBusinesses = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    loadBusinessesFromDatabase();
    setupEventListeners();
    setupFormValidation();
    initializePanchang();
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

function updateSpecialEvents() {
    const today = new Date();
    const events = [];
    
    // Check for special Hindu festivals and observances
    const dayOfMonth = today.getDate();
    const month = today.getMonth() + 1;
    
    // Ekadashi (11th day of lunar fortnight) - approximate
    if (dayOfMonth === 11 || dayOfMonth === 26) {
        events.push('एकादशी व्रत');
    }
    
    // Purnima (Full Moon) - approximate
    if (dayOfMonth === 15) {
        events.push('पूर्णिमा');
    }
    
    // Amavasya (New Moon) - approximate  
    if (dayOfMonth === 30 || (dayOfMonth === 29 && month === 2)) {
        events.push('अमावस्या');
    }
    
    // Major festivals (simplified calendar)
    const festivals = {
        '1-26': 'गणतंत्र दिवस',
        '3-8': 'महाशिवरात्रि',
        '3-21': 'होली',
        '4-14': 'बैसाखी',
        '8-15': 'स्वतंत्रता दिवस',
        '8-19': 'जन्माष्टमी',
        '9-2': 'गणेश चतुर्थी',
        '10-2': 'गांधी जयंती',
        '10-24': 'दशहरा',
        '11-12': 'दीपावली',
        '11-14': 'बाल दिवस'
    };
    
    const todayKey = `${month}-${dayOfMonth}`;
    if (festivals[todayKey]) {
        events.push(festivals[todayKey]);
    }
    
    // Update the scrolling banner
    const eventText = events.length > 0 
        ? `🚩 आज के विशेष अवसर: ${events.join(' • ')} 🚩`
        : '🚩 आज शुभ दिन है - सनातनी व्यापारियों से जुड़ें 🚩';
    
    document.getElementById('specialEvents').textContent = eventText;
}

// Navigation Functions
function setupNavigation() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
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
    
    // Special handling for dashboard section
    if (sectionId === 'dashboard') {
        displayBusinesses();
        displayFeaturedBusinesses();
    }
    
    // Close mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

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
        } else {
            console.error('Failed to load businesses');
            showNotification('व्यापार लोड करने में समस्या हुई', 'error');
        }
    } catch (error) {
        console.error('Error loading businesses:', error);
        showNotification('सर्वर से कनेक्शन में समस्या', 'error');
    }
}

// Populate filter dropdown options
function populateFilterOptions() {
    const districtFilter = document.getElementById('district-filter');
    const categoryFilter = document.getElementById('category-filter');
    
    if (districtFilter && categoryFilter) {
        // Get unique districts and categories
        const districts = [...new Set(allBusinesses.map(b => b.district))].sort();
        const categories = [...new Set(allBusinesses.map(b => b.category))].sort();
        
        // Populate district filter
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtFilter.appendChild(option);
        });
        
        // Populate category filter
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search and filter inputs
    const searchInput = document.getElementById('search-input');
    const districtFilter = document.getElementById('district-filter');
    const categoryFilter = document.getElementById('category-filter');
    const pincodeFilter = document.getElementById('pincode-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterBusinesses, 300));
    }
    
    if (districtFilter) {
        districtFilter.addEventListener('change', filterBusinesses);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterBusinesses);
    }
    
    if (pincodeFilter) {
        pincodeFilter.addEventListener('input', debounce(filterBusinesses, 300));
    }
}

// Filter businesses based on search criteria
function filterBusinesses() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const selectedDistrict = document.getElementById('district-filter')?.value || '';
    const selectedCategory = document.getElementById('category-filter')?.value || '';
    const selectedPincode = document.getElementById('pincode-filter')?.value || '';
    
    const filteredBusinesses = allBusinesses.filter(business => {
        const matchesSearch = business.business_name.toLowerCase().includes(searchTerm) ||
                            business.owner_name.toLowerCase().includes(searchTerm) ||
                            business.description.toLowerCase().includes(searchTerm);
        
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

// Create business card for grid view
function createBusinessCard(business) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300';
    
    card.innerHTML = `
        <div class="relative">
            ${business.business_image ? 
                `<img src="${business.business_image}" alt="${business.business_name}" class="w-full h-48 object-cover">` :
                `<div class="w-full h-48 bg-orange-100 flex items-center justify-center">
                    <i class="fas fa-store text-4xl text-orange-500"></i>
                </div>`
            }
            ${business.featured ? '<div class="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">विशेष</div>' : ''}
        </div>
        
        <div class="p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-2 hindi-font">${business.business_name}</h3>
            <p class="text-gray-600 mb-2 hindi-font">${business.owner_name}</p>
            <div class="flex items-center mb-2">
                <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm hindi-font">${business.category}</span>
                <span class="ml-2 text-gray-500 text-sm">${business.district}</span>
            </div>
            
            <p class="text-gray-600 text-sm mb-4 hindi-font line-clamp-2">${business.description || 'विवरण उपलब्ध नहीं'}</p>
            
            <div class="flex items-center justify-between mb-4">
                <span class="text-gray-500 text-sm">${business.pincode}</span>
                <span class="text-xs text-gray-400">ID: ${business.sanatani_id}</span>
            </div>
            
            <div class="flex gap-2">
                ${business.whatsapp ? 
                    `<a href="https://wa.me/91${business.whatsapp}" target="_blank" class="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-center text-sm hover:bg-green-600 transition-colors">
                        <i class="fab fa-whatsapp mr-1"></i>WhatsApp
                    </a>` : ''
                }
                <button onclick="shareBusinessWhatsApp('${business.sanatani_id}')" class="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                    <i class="fas fa-share"></i>
                </button>
                <button onclick="viewBusinessProfile('${business.sanatani_id}')" class="bg-orange-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors">
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
    listItem.className = 'bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300';
    
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
                <div class="flex items-start justify-between mb-2">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 hindi-font">${business.business_name}</h3>
                        <p class="text-gray-600 hindi-font">${business.owner_name}</p>
                    </div>
                    ${business.featured ? '<span class="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">विशेष</span>' : ''}
                </div>
                
                <div class="flex items-center mb-3">
                    <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm hindi-font">${business.category}</span>
                    <span class="ml-3 text-gray-500">${business.district}, ${business.state}</span>
                    <span class="ml-3 text-gray-500">${business.pincode}</span>
                </div>
                
                <p class="text-gray-600 mb-4 hindi-font">${business.description || 'विवरण उपलब्ध नहीं'}</p>
                
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-400">ID: ${business.sanatani_id}</span>
                    <div class="flex gap-2">
                        ${business.whatsapp ? 
                            `<a href="https://wa.me/91${business.whatsapp}" target="_blank" class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors">
                                <i class="fab fa-whatsapp mr-1"></i>WhatsApp
                            </a>` : ''
                        }
                        <button onclick="shareBusinessWhatsApp('${business.sanatani_id}')" class="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                            <i class="fas fa-share mr-1"></i>Share
                        </button>
                        <button onclick="viewBusinessProfile('${business.sanatani_id}')" class="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors">
                            <i class="fas fa-eye mr-1"></i>View
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

// Export functions for global access
window.showSection = showSection;
window.setViewMode = setViewMode;
window.shareBusinessWhatsApp = shareBusinessWhatsApp;
window.viewBusinessProfile = viewBusinessProfile;