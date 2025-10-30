/**
 * Ana Sayfa Bölümleri Yönetimi JavaScript
 * Gürbüz Oyuncak Admin Paneli
 */

const API_BASE = '../backend/api/homepage_sections.php';
const PRODUCTS_API = '../backend/api/products.php';

let allProducts = [];
let currentSectionId = null;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    loadSections();
    loadAllProducts();
});

/**
 * Tüm bölümleri yükle
 */
function loadSections() {
    fetch(API_BASE)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displaySections(data.data);
            } else {
                showError('Bölümler yüklenemedi');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Bir hata oluştu');
        });
}

/**
 * Tüm ürünleri yükle
 */
function loadAllProducts() {
    fetch(PRODUCTS_API)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allProducts = data.data;
            }
        })
        .catch(error => {
            console.error('Error loading products:', error);
        });
}

/**
 * Bölümleri tabloda göster
 */
function displaySections(sections) {
    const tbody = document.getElementById('sectionsTableBody');
    
    if (sections.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Henüz bölüm eklenmemiş</td></tr>';
        return;
    }
    
    const typeLabels = {
        'populer': 'Popüler',
        'yeni_gelenler': 'Yeni Gelenler',
        'sectiklerimiz': 'Seçtiklerimiz',
        'indirimli': 'İndirimli'
    };
    
    tbody.innerHTML = sections.map(section => `
        <tr>
            <td>
                <span class="type-badge type-${section.section_type}">
                    ${typeLabels[section.section_type] || section.section_type}
                </span>
            </td>
            <td>
                <strong>${section.title}</strong><br>
                <small>${section.subtitle || ''}</small>
            </td>
            <td>${section.display_order}</td>
            <td>${section.max_items}</td>
            <td>
                <span class="badge badge-info">${section.product_count || 0} ürün</span>
            </td>
            <td>
                <span class="badge ${section.is_active == 1 ? 'badge-success' : 'badge-danger'}">
                    ${section.is_active == 1 ? 'Aktif' : 'Pasif'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-success" onclick="manageProducts(${section.id})">Ürünler</button>
                    <button class="btn btn-sm btn-primary" onclick="editSection(${section.id})">Düzenle</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSection(${section.id})">Sil</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Modal aç
 */
function openModal() {
    document.getElementById('modalTitle').textContent = 'Yeni Bölüm Ekle';
    document.getElementById('sectionForm').reset();
    document.getElementById('sectionId').value = '';
    document.getElementById('isActive').checked = true;
    document.getElementById('sectionModal').style.display = 'block';
}

/**
 * Modal kapat
 */
function closeModal() {
    document.getElementById('sectionModal').style.display = 'none';
}

/**
 * Bölüm formu gönder
 */
document.getElementById('sectionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const sectionId = document.getElementById('sectionId').value;
    
    const sectionData = {
        section_type: document.getElementById('sectionType').value,
        title: document.getElementById('title').value,
        subtitle: document.getElementById('subtitle').value,
        display_order: parseInt(document.getElementById('displayOrder').value),
        max_items: parseInt(document.getElementById('maxItems').value),
        is_active: document.getElementById('isActive').checked ? 1 : 0,
        background_color: document.getElementById('backgroundColor').value || null
    };
    
    const method = sectionId ? 'PUT' : 'POST';
    const url = sectionId ? `${API_BASE}/${sectionId}` : API_BASE;
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sectionData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal();
            loadSections();
            showSuccess(sectionId ? 'Bölüm güncellendi' : 'Bölüm eklendi');
        } else {
            showError(data.message || 'İşlem başarısız');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Bir hata oluştu');
    });
});

/**
 * Bölüm düzenle
 */
function editSection(id) {
    fetch(`${API_BASE}/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const section = data.data;
                
                document.getElementById('modalTitle').textContent = 'Bölüm Düzenle';
                document.getElementById('sectionId').value = section.id;
                document.getElementById('sectionType').value = section.section_type;
                document.getElementById('title').value = section.title;
                document.getElementById('subtitle').value = section.subtitle || '';
                document.getElementById('displayOrder').value = section.display_order;
                document.getElementById('maxItems').value = section.max_items;
                document.getElementById('isActive').checked = section.is_active == 1;
                document.getElementById('backgroundColor').value = section.background_color || '#FFFFFF';
                
                document.getElementById('sectionModal').style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Bölüm yüklenemedi');
        });
}

/**
 * Bölüm sil
 */
function deleteSection(id) {
    if (!confirm('Bu bölümü silmek istediğinize emin misiniz?')) {
        return;
    }
    
    fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadSections();
            showSuccess('Bölüm silindi');
        } else {
            showError(data.message || 'Silme işlemi başarısız');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Bir hata oluştu');
    });
}

/**
 * Bölüm ürünlerini yönet
 */
function manageProducts(sectionId) {
    currentSectionId = sectionId;
    
    // Bölüm bilgisini al
    fetch(`${API_BASE}/${sectionId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const section = data.data;
                document.getElementById('productsModalTitle').textContent = `${section.title} - Ürün Yönetimi`;
                
                // Ürün listesini doldur
                populateProductSelect();
                
                // Mevcut ürünleri yükle
                loadSectionProducts(sectionId);
                
                document.getElementById('productsModal').style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Bölüm bilgisi yüklenemedi');
        });
}

/**
 * Ürün seçim listesini doldur
 */
function populateProductSelect() {
    const select = document.getElementById('productSelect');
    select.innerHTML = '<option value="">Ürün seçin...</option>';
    
    allProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name;
        select.appendChild(option);
    });
}

/**
 * Bölüm ürünlerini yükle
 */
function loadSectionProducts(sectionId) {
    fetch(`${API_BASE}/${sectionId}/products`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displaySectionProducts(data.data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

/**
 * Bölüm ürünlerini göster
 */
function displaySectionProducts(products) {
    const grid = document.getElementById('sectionProductsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Bu bölümde henüz ürün yok. Otomatik seçim kullanılacak.</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-item">
            <button class="remove-btn" onclick="removeProductFromSection(${product.id})" title="Çıkar">×</button>
            <img src="${product.primary_image || '/public/images/no-image.png'}" alt="${product.name}">
            <p style="font-size: 0.75rem; margin-top: 0.5rem;">${product.name}</p>
            <p style="font-size: 0.625rem; color: #6B7280;">${product.price} TL</p>
        </div>
    `).join('');
}

/**
 * Bölüme ürün ekle
 */
function addProductToSection() {
    const productId = document.getElementById('productSelect').value;
    
    if (!productId) {
        return;
    }
    
    fetch(`${API_BASE}/${currentSectionId}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: parseInt(productId) })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadSectionProducts(currentSectionId);
            loadSections(); // Ürün sayısını güncelle
            document.getElementById('productSelect').value = '';
            showSuccess('Ürün eklendi');
        } else {
            showError(data.message || 'Ürün eklenemedi');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Bir hata oluştu');
    });
}

/**
 * Bölümden ürün çıkar
 */
function removeProductFromSection(productId) {
    if (!confirm('Bu ürünü bölümden çıkarmak istediğinize emin misiniz?')) {
        return;
    }
    
    fetch(`${API_BASE}/${currentSectionId}/products`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: productId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadSectionProducts(currentSectionId);
            loadSections(); // Ürün sayısını güncelle
            showSuccess('Ürün çıkarıldı');
        } else {
            showError(data.message || 'Ürün çıkarılamadı');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Bir hata oluştu');
    });
}

/**
 * Ürünler modalını kapat
 */
function closeProductsModal() {
    document.getElementById('productsModal').style.display = 'none';
    currentSectionId = null;
}

/**
 * Başarı mesajı göster
 */
function showSuccess(message) {
    alert(message);
}

/**
 * Hata mesajı göster
 */
function showError(message) {
    alert('Hata: ' + message);
}

// Modal dışına tıklandığında kapat
window.onclick = function(event) {
    const sectionModal = document.getElementById('sectionModal');
    const productsModal = document.getElementById('productsModal');
    
    if (event.target === sectionModal) {
        closeModal();
    }
    if (event.target === productsModal) {
        closeProductsModal();
    }
};
