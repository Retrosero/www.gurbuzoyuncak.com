/**
 * Ana Sayfa JavaScript
 * Banner ve dinamik bölüm yükleme
 * Gürbüz Oyuncak
 */

const BANNERS_API = '../backend/api/banners.php';
const SECTIONS_API = '../backend/api/homepage_sections.php';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    loadBanners();
    loadHomepageSections();
    updateCartCount();
});

/**
 * Banner'ları yükle
 */
function loadBanners() {
    fetch(`${BANNERS_API}?active_only=1`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                displayBanners(data.data);
            } else {
                // Banner yoksa gizle
                const container = document.getElementById('banner-slider');
                if (container) {
                    container.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('Banner\'lar yüklenirken hata:', error);
        });
}

/**
 * Banner'ları göster
 */
function displayBanners(banners) {
    const container = document.getElementById('banner-slides');
    const dotsContainer = document.getElementById('banner-dots');
    
    if (!container) return;
    
    // Banner slide'ları oluştur
    container.innerHTML = banners.map((banner, index) => `
        <div class="banner-slide ${index === 0 ? 'active' : ''}" 
             style="background-color: ${banner.background_color}; color: ${banner.text_color};">
            <div class="container">
                <div class="banner-content">
                    <h2>${banner.title}</h2>
                    ${banner.subtitle ? `<p>${banner.subtitle}</p>` : ''}
                    ${banner.link_url ? `
                        <a href="${banner.link_url}" class="btn btn-primary">
                            ${banner.link_text || 'Şimdi Keşfet'}
                        </a>
                    ` : ''}
                </div>
                <div class="banner-image">
                    <img src="${banner.image_url}" alt="${banner.title}">
                </div>
            </div>
        </div>
    `).join('');
    
    // Dot navigasyon oluştur
    if (dotsContainer && banners.length > 1) {
        dotsContainer.innerHTML = banners.map((_, index) => `
            <span class="banner-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></span>
        `).join('');
    }
    
    // Otomatik geçiş başlat (birden fazla banner varsa)
    if (banners.length > 1) {
        startBannerAutoplay();
    }
}

let currentSlide = 0;
let bannerInterval;

/**
 * Banner otomatik geçiş
 */
function startBannerAutoplay() {
    bannerInterval = setInterval(() => {
        nextSlide();
    }, 5000); // 5 saniyede bir değiş
}

/**
 * Sonraki slide
 */
function nextSlide() {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.banner-dot');
    
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    
    currentSlide = (currentSlide + 1) % slides.length;
    
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

/**
 * Önceki slide
 */
function prevSlide() {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.banner-dot');
    
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    
    // Otomatik geçişi sıfırla
    clearInterval(bannerInterval);
    startBannerAutoplay();
}

/**
 * Belirli bir slide'a git
 */
function goToSlide(index) {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.banner-dot');
    
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    
    // Otomatik geçişi sıfırla
    clearInterval(bannerInterval);
    startBannerAutoplay();
}

/**
 * Ana sayfa bölümlerini yükle
 */
function loadHomepageSections() {
    fetch(`${SECTIONS_API}?is_active=1&with_products=1`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                displayHomepageSections(data.data);
            }
        })
        .catch(error => {
            console.error('Ana sayfa bölümleri yüklenirken hata:', error);
        });
}

/**
 * Ana sayfa bölümlerini göster
 */
function displayHomepageSections(sections) {
    const container = document.getElementById('dynamic-sections');
    
    if (!container) return;
    
    container.innerHTML = sections.map((section, index) => {
        const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
        const sectionBg = section.background_color || bgColor;
        
        return `
            <section class="section" style="background-color: ${sectionBg};">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">${section.title}</h2>
                        ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
                    </div>
                    
                    <div class="product-grid">
                        ${section.products && section.products.length > 0 
                            ? section.products.map(product => createProductCard(product)).join('')
                            : '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;"><p style="color: #6B7280;">Bu bölümde henüz ürün bulunmuyor.</p></div>'
                        }
                    </div>
                    
                    ${section.products && section.products.length > 0 ? `
                        <div style="text-align: center; margin-top: 3rem;">
                            <a href="products.html?section=${section.section_type}" class="btn btn-primary">Tümünü Gör</a>
                        </div>
                    ` : ''}
                </div>
            </section>
        `;
    }).join('');
}
