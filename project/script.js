document.addEventListener('DOMContentLoaded', () => {
    console.log("Maybi Tea Time Script Active");

    // --- 1. GLOBAL: STICKY HEADER ---
    const header = document.querySelector('.page-header');
    if (header) {
        const handleHeaderScroll = () => {
            const scrollValue = window.scrollY || window.pageYOffset;
            if (scrollValue > 50) {
                header.style.padding = "10px 0";
                header.style.backgroundColor = "rgba(255, 255, 255, 0.98)";
                header.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
            } else {
                header.style.padding = "15px 0";
                header.style.backgroundColor = "white";
                header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.3)";
            }
        };
        window.addEventListener('scroll', handleHeaderScroll);
        handleHeaderScroll();
    }

    // --- 2. GLOBAL: ENHANCED PARALLAX (Noticeable but Clamped) ---
    // Added specific check for matcha3 and other stickers
    const parallaxElements = document.querySelectorAll('.sticker, .manual-circle, .photo_bg img, .gbunny, .ybunny');
    
    if (parallaxElements.length > 0) {
        const initialStates = new Map();
        parallaxElements.forEach(el => {
            // Ensure they are visible
            el.style.opacity = "1";
            el.style.display = "block";
            // Smooth gliding transition
            el.style.transition = "transform 0.8s cubic-bezier(0.15, 0.83, 0.66, 1)";
            
            const style = window.getComputedStyle(el);
            initialStates.set(el, style.transform === 'none' ? '' : style.transform);
        });

        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX - window.innerWidth / 2;
            const mouseY = e.clientY - window.innerHeight / 2;

            // ADJUSTED VALUES FOR MORE MOVEMENT
            const slowness = 60; 
            const limit = 45;    

            parallaxElements.forEach((el) => {
                let moveX = mouseX / slowness;
                let moveY = mouseY / slowness;

                // Clamping to prevent elements from going off-screen
                moveX = Math.max(-limit, Math.min(limit, moveX));
                moveY = Math.max(-limit, Math.min(limit, moveY));

                // Preserve existing rotations (vital for Sugar Bunnies)
                const baseTransform = initialStates.get(el);
                el.style.transform = `translate(${moveX}px, ${moveY}px) ${baseTransform}`;
            });
        });
    }

    // --- 4. ABOUT PAGE: SCROLL REVEAL ---
    const textBlocks = document.querySelectorAll('.about-text-block');
    if (textBlocks.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Fallback styles if class is not defined in CSS
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        textBlocks.forEach(block => {
            block.style.opacity = "0";
            block.style.transform = "translateY(30px)";
            block.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            revealObserver.observe(block);
        });
    }

    if (document.getElementById('card-container')) {
        initMenu();
    }
});

/* ==========================================================================
   MENU LOGIC SECTION
   ========================================================================== */

let currentTab = 'drinks';
let currentCategory = 'all';
let currentIndex = 0;

function initMenu() {
    if (typeof switchTab === 'function') {
        switchTab('drinks');
    }
}

window.switchTab = function(tab) {
    currentTab = tab;
    currentCategory = 'all';

    const tabDrinks = document.getElementById('tab-drinks');
    const tabBunnies = document.getElementById('tab-bunnies');
    
    if(tabDrinks) tabDrinks.classList.toggle('selected', tab === 'drinks');
    if(tabBunnies) tabBunnies.classList.toggle('selected', tab === 'bunnies');

    renderCategories();
    renderCards();
    resetSlider();
};

window.renderCategories = function() {
    const container = document.getElementById('category-container');
    if(!container || !window.menuData) return;
    
    container.innerHTML = menuData[currentTab].categories.map(cat =>
        `<button class="category-btn ${cat === currentCategory ? 'active' : ''}" 
         onclick="filterItems('${cat}', this)">${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>`
    ).join('');
};

window.renderCards = function() {
    const container = document.getElementById('card-container');
    if(!container || !window.menuData) return;
    
    container.innerHTML = menuData[currentTab].items.map((item, index) => {
        const customClass = item.name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-').toLowerCase();
        const delay = index * 0.05;
        
        return `
            <div class="drink fade-in-slide" 
                 style="animation-delay: ${delay}s" 
                 data-category="${item.category}" 
                 onclick="openModal('${item.name.replace(/'/g, "\\'")}')">
                <div class="drink-display">
                    <div class="drink-img-container">
                        <img class="drink-img ${customClass}" 
                             src="${item.img}" 
                             onerror="this.src='imgs/logo.png'">
                    </div>
                    <p class="price">${item.price}</p>
                </div>
                <div class="drink-desc">
                    <p class="title">${item.name} ${item.favorite ? '<span class="star-icon">★</span>' : ''}</p>
                    <p class="serving">${item.serving}</p>
                </div>
                <div class="drink-tag-container">
                    ${item.tags.map(t => `<p class="drink-tag">${t}</p>`).join('')}
                </div>
            </div>
        `;
    }).join('');
};

window.filterItems = function(category, element) {
    currentCategory = category;
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    searchDrinks();
};

window.searchDrinks = function() {
    const searchInput = document.getElementById('drinkSearch');
    const filter = searchInput ? searchInput.value.toLowerCase() : "";
    const cards = document.querySelectorAll('.drink');

    cards.forEach((card, index) => {
        const title = card.querySelector('.title').innerText.toLowerCase();
        const cardCat = card.getAttribute('data-category');
        const matchesSearch = title.includes(filter);
        const matchesCat = (currentCategory === 'all' || cardCat === currentCategory);
        
        if (matchesSearch && matchesCat) {
            card.style.display = 'flex';
            card.style.animationDelay = `${index * 0.03}s`;
        } else {
            card.style.display = 'none';
        }
    });
    resetSlider();
};

window.openModal = function(name) {
    if (!window.menuData) return;
    const item = menuData[currentTab].items.find(i => i.name === name);
    if (!item) return;

    document.getElementById('favBadge').style.display = item.favorite ? 'flex' : 'none';
    document.getElementById('modalTitle').innerText = item.name;
    document.getElementById('modalServing').innerText = item.serving;
    
    // UPDATE: Wrap the price in a styled span
    document.getElementById('modalPrice').innerHTML = `<span class="modal-price-tag">${item.price}</span>`;
    
    document.getElementById('modalImg').src = item.img;
    document.getElementById('modalBulletPoints').innerHTML = item.details.map(d => `<li>${d}</li>`).join('');
    document.getElementById('modalTags').innerHTML = item.tags.map(t => `<p class="drink-tag">${t}</p>`).join('');

    const modal = document.getElementById('drinkModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closeModal = function() {
    const modal = document.getElementById('drinkModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.moveSlider = function(direction) {
    const visibleCards = Array.from(document.querySelectorAll('.drink')).filter(c => c.style.display !== 'none');
    const scrollAmount = 260; 
    const maxIndex = Math.max(0, visibleCards.length - 3);

    currentIndex = Math.min(Math.max(currentIndex + direction, 0), maxIndex);
    const container = document.getElementById('card-container');
    if (container) {
        container.style.transform = `translateX(-${currentIndex * scrollAmount}px)`;
    }
    updateNavButtons(visibleCards.length);
};

window.resetSlider = function() {
    currentIndex = 0;
    const container = document.getElementById('card-container');
    if(container) container.style.transform = `translateX(0px)`;
    const visibleCount = Array.from(document.querySelectorAll('.drink')).filter(c => c.style.display !== 'none').length;
    updateNavButtons(visibleCount);
};

window.updateNavButtons = function(visibleCount) {
    const maxIndex = Math.max(0, visibleCount - 3);
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if(prevBtn) prevBtn.classList.toggle('disabled', currentIndex <= 0);
    if(nextBtn) nextBtn.classList.toggle('disabled', currentIndex >= maxIndex || visibleCount <= 3);
};

window.addEventListener('click', (e) => {
    if (e.target.id === 'drinkModal') closeModal();
});