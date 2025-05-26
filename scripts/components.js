// Component-specific JavaScript for Sanatan Vyaapar website

// Search functionality
class SearchComponent {
    constructor(searchInput, searchResults, searchData) {
        this.searchInput = document.getElementById(searchInput);
        this.searchResults = document.getElementById(searchResults);
        this.searchData = searchData || [];
        this.currentIndex = -1;
        
        if (this.searchInput) {
            this.init();
        }
    }
    
    init() {
        this.searchInput.addEventListener('input', this.handleInput.bind(this));
        this.searchInput.addEventListener('keydown', this.handleKeydown.bind(this));
        this.searchInput.addEventListener('focus', this.handleFocus.bind(this));
        document.addEventListener('click', this.handleClickOutside.bind(this));
    }
    
    handleInput(e) {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            this.hideResults();
            return;
        }
        
        const results = this.search(query);
        this.displayResults(results);
    }
    
    handleKeydown(e) {
        const items = this.searchResults.querySelectorAll('.search-item');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.currentIndex = Math.min(this.currentIndex + 1, items.length - 1);
                this.updateSelection(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.currentIndex = Math.max(this.currentIndex - 1, -1);
                this.updateSelection(items);
                break;
            case 'Enter':
                e.preventDefault();
                if (this.currentIndex >= 0 && items[this.currentIndex]) {
                    items[this.currentIndex].click();
                }
                break;
            case 'Escape':
                this.hideResults();
                break;
        }
    }
    
    handleFocus() {
        if (this.searchInput.value.trim().length >= 2) {
            const results = this.search(this.searchInput.value.trim());
            this.displayResults(results);
        }
    }
    
    handleClickOutside(e) {
        if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
            this.hideResults();
        }
    }
    
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.searchData.filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.description.toLowerCase().includes(lowerQuery) ||
            item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }
    
    displayResults(results) {
        if (results.length === 0) {
            this.searchResults.innerHTML = '<div class="search-no-results">कोई परिणाम नहीं मिला</div>';
        } else {
            this.searchResults.innerHTML = results.map((item, index) => `
                <div class="search-item" data-index="${index}">
                    <div class="search-item-title">${this.highlightMatch(item.title, this.searchInput.value)}</div>
                    <div class="search-item-description">${this.highlightMatch(item.description, this.searchInput.value)}</div>
                    <div class="search-item-url">${item.url}</div>
                </div>
            `).join('');
            
            // Add click handlers
            this.searchResults.querySelectorAll('.search-item').forEach(item => {
                item.addEventListener('click', () => {
                    window.location.href = item.querySelector('.search-item-url').textContent;
                });
            });
        }
        
        this.showResults();
        this.currentIndex = -1;
    }
    
    highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    updateSelection(items) {
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.currentIndex);
        });
    }
    
    showResults() {
        this.searchResults.classList.add('visible');
    }
    
    hideResults() {
        this.searchResults.classList.remove('visible');
        this.currentIndex = -1;
    }
}

// Modal component
class ModalComponent {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.overlay = this.modal?.querySelector('.modal-overlay');
        this.content = this.modal?.querySelector('.modal-content');
        this.closeButtons = this.modal?.querySelectorAll('.modal-close');
        
        if (this.modal) {
            this.init();
        }
    }
    
    init() {
        // Close button handlers
        this.closeButtons?.forEach(button => {
            button.addEventListener('click', () => this.close());
        });
        
        // Overlay click handler
        this.overlay?.addEventListener('click', () => this.close());
        
        // Escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
        
        // Prevent content clicks from closing modal
        this.content?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    open() {
        this.modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Focus management
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
        
        // Trigger custom event
        this.modal.dispatchEvent(new CustomEvent('modal:open'));
    }
    
    close() {
        this.modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        
        // Trigger custom event
        this.modal.dispatchEvent(new CustomEvent('modal:close'));
    }
    
    isOpen() {
        return this.modal.classList.contains('active');
    }
}

// Carousel component
class CarouselComponent {
    constructor(carouselId, options = {}) {
        this.carousel = document.getElementById(carouselId);
        this.slides = this.carousel?.querySelectorAll('.carousel-slide');
        this.prevButton = this.carousel?.querySelector('.carousel-prev');
        this.nextButton = this.carousel?.querySelector('.carousel-next');
        this.indicators = this.carousel?.querySelector('.carousel-indicators');
        
        this.currentSlide = 0;
        this.isPlaying = false;
        this.interval = null;
        
        this.options = {
            autoplay: true,
            autoplayInterval: 5000,
            loop: true,
            showIndicators: true,
            ...options
        };
        
        if (this.carousel && this.slides.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.setupIndicators();
        this.setupEventListeners();
        
        if (this.options.autoplay) {
            this.play();
        }
        
        this.goToSlide(0);
    }
    
    setupIndicators() {
        if (!this.options.showIndicators || !this.indicators) return;
        
        this.indicators.innerHTML = '';
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            indicator.setAttribute('aria-label', `स्लाइड ${index + 1} पर जाएं`);
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.indicators.appendChild(indicator);
        });
    }
    
    setupEventListeners() {
        this.prevButton?.addEventListener('click', () => this.prevSlide());
        this.nextButton?.addEventListener('click', () => this.nextSlide());
        
        // Pause on hover
        this.carousel.addEventListener('mouseenter', () => this.pause());
        this.carousel.addEventListener('mouseleave', () => {
            if (this.options.autoplay) this.play();
        });
        
        // Keyboard navigation
        this.carousel.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
            }
        });
        
        // Touch/swipe support
        this.setupTouchEvents();
    }
    
    setupTouchEvents() {
        let startX = 0;
        let endX = 0;
        
        this.carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        });
    }
    
    goToSlide(index) {
        // Remove active class from all slides
        this.slides.forEach(slide => slide.classList.remove('active'));
        
        // Remove active class from all indicators
        const indicators = this.indicators?.querySelectorAll('.carousel-indicator');
        indicators?.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to current slide and indicator
        this.slides[index].classList.add('active');
        indicators?.[index]?.classList.add('active');
        
        this.currentSlide = index;
        
        // Trigger custom event
        this.carousel.dispatchEvent(new CustomEvent('carousel:change', {
            detail: { currentSlide: index }
        }));
    }
    
    nextSlide() {
        let nextIndex = this.currentSlide + 1;
        
        if (nextIndex >= this.slides.length) {
            nextIndex = this.options.loop ? 0 : this.slides.length - 1;
        }
        
        this.goToSlide(nextIndex);
    }
    
    prevSlide() {
        let prevIndex = this.currentSlide - 1;
        
        if (prevIndex < 0) {
            prevIndex = this.options.loop ? this.slides.length - 1 : 0;
        }
        
        this.goToSlide(prevIndex);
    }
    
    play() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.interval = setInterval(() => {
            this.nextSlide();
        }, this.options.autoplayInterval);
    }
    
    pause() {
        this.isPlaying = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    destroy() {
        this.pause();
        // Remove event listeners and clean up
    }
}

// Accordion component
class AccordionComponent {
    constructor(accordionId) {
        this.accordion = document.getElementById(accordionId);
        this.items = this.accordion?.querySelectorAll('.accordion-item');
        
        if (this.accordion) {
            this.init();
        }
    }
    
    init() {
        this.items.forEach((item, index) => {
            const header = item.querySelector('.accordion-header');
            const content = item.querySelector('.accordion-content');
            
            header?.addEventListener('click', () => {
                this.toggleItem(item, index);
            });
            
            // Keyboard support
            header?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleItem(item, index);
                }
            });
        });
    }
    
    toggleItem(item, index) {
        const isActive = item.classList.contains('active');
        const content = item.querySelector('.accordion-content');
        
        if (isActive) {
            this.closeItem(item);
        } else {
            // Close other items (if single-open behavior is desired)
            this.items.forEach(otherItem => {
                if (otherItem !== item) {
                    this.closeItem(otherItem);
                }
            });
            
            this.openItem(item);
        }
    }
    
    openItem(item) {
        const content = item.querySelector('.accordion-content');
        item.classList.add('active');
        
        if (content) {
            content.style.maxHeight = content.scrollHeight + 'px';
        }
        
        // Trigger custom event
        item.dispatchEvent(new CustomEvent('accordion:open'));
    }
    
    closeItem(item) {
        const content = item.querySelector('.accordion-content');
        item.classList.remove('active');
        
        if (content) {
            content.style.maxHeight = '0';
        }
        
        // Trigger custom event
        item.dispatchEvent(new CustomEvent('accordion:close'));
    }
}

// Tab component
class TabComponent {
    constructor(tabsId) {
        this.tabsContainer = document.getElementById(tabsId);
        this.tabButtons = this.tabsContainer?.querySelectorAll('.tab-button');
        this.tabPanels = this.tabsContainer?.querySelectorAll('.tab-panel');
        this.currentTab = 0;
        
        if (this.tabsContainer) {
            this.init();
        }
    }
    
    init() {
        this.tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                this.switchTab(index);
            });
            
            // Keyboard support
            button.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        const prevIndex = index > 0 ? index - 1 : this.tabButtons.length - 1;
                        this.switchTab(prevIndex);
                        this.tabButtons[prevIndex].focus();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        const nextIndex = index < this.tabButtons.length - 1 ? index + 1 : 0;
                        this.switchTab(nextIndex);
                        this.tabButtons[nextIndex].focus();
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.switchTab(0);
                        this.tabButtons[0].focus();
                        break;
                    case 'End':
                        e.preventDefault();
                        const lastIndex = this.tabButtons.length - 1;
                        this.switchTab(lastIndex);
                        this.tabButtons[lastIndex].focus();
                        break;
                }
            });
        });
        
        // Initialize first tab
        this.switchTab(0);
    }
    
    switchTab(index) {
        // Remove active state from all tabs and panels
        this.tabButtons.forEach(button => {
            button.classList.remove('active');
            button.setAttribute('aria-selected', 'false');
        });
        
        this.tabPanels.forEach(panel => {
            panel.classList.remove('active');
            panel.setAttribute('aria-hidden', 'true');
        });
        
        // Add active state to selected tab and panel
        this.tabButtons[index].classList.add('active');
        this.tabButtons[index].setAttribute('aria-selected', 'true');
        
        this.tabPanels[index].classList.add('active');
        this.tabPanels[index].setAttribute('aria-hidden', 'false');
        
        this.currentTab = index;
        
        // Trigger custom event
        this.tabsContainer.dispatchEvent(new CustomEvent('tab:change', {
            detail: { currentTab: index }
        }));
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize search if search elements exist
    if (document.getElementById('searchInput')) {
        new SearchComponent('searchInput', 'searchResults', [
            {
                title: 'मुख्य पृष्ठ',
                description: 'सनातन व्यापार का मुख्य पृष्ठ',
                url: 'index.html',
                tags: ['home', 'main', 'मुख्य']
            },
            {
                title: 'हमारे बारे में',
                description: 'सनातन व्यापार की जानकारी',
                url: 'pages/about.html',
                tags: ['about', 'information', 'जानकारी']
            },
            {
                title: 'सेवाएं',
                description: 'हमारी व्यापारिक सेवाएं',
                url: 'pages/services.html',
                tags: ['services', 'business', 'सेवाएं']
            },
            {
                title: 'उत्पाद',
                description: 'हमारे उत्पादों की श्रेणी',
                url: 'pages/products.html',
                tags: ['products', 'items', 'उत्पाद']
            },
            {
                title: 'संपर्क',
                description: 'हमसे संपर्क करें',
                url: 'pages/contact.html',
                tags: ['contact', 'reach', 'संपर्क']
            }
        ]);
    }
    
    // Initialize modals
    document.querySelectorAll('.modal').forEach(modal => {
        new ModalComponent(modal.id);
    });
    
    // Initialize carousels
    document.querySelectorAll('.carousel').forEach(carousel => {
        new CarouselComponent(carousel.id);
    });
    
    // Initialize accordions
    document.querySelectorAll('.accordion').forEach(accordion => {
        new AccordionComponent(accordion.id);
    });
    
    // Initialize tabs
    document.querySelectorAll('.tabs').forEach(tabs => {
        new TabComponent(tabs.id);
    });
});

// Export components for external use
window.SanatanVyaaparComponents = {
    SearchComponent,
    ModalComponent,
    CarouselComponent,
    AccordionComponent,
    TabComponent
};
