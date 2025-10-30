/**
 * Banner Yönetimi JavaScript
 * Gürbüz Oyuncak Admin Paneli
 */

const API_BASE = '../backend/api/banners.php';

// Sayfa yüklendiğinde banner'ları getir
document.addEventListener('DOMContentLoaded', function() {
    loadBanners();
});

/**
 * Tüm banner'ları yükle
 */
function loadBanners() {
    fetch(API_BASE)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayBanners(data.data);
            } else {
                showError('Banner'lar yüklenemedi');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Bir hata oluştu');
        });
}

/**
 * Banner'ları tabloda göster
 */
function displayBanners(banners) {
    const tbody = document.getElementById('bannersTableBody');
    
    if (banners.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Henüz banner eklenmemiş</td></tr>';
        return;
    }
    
    tbody.innerHTML = banners.map(banner => `
        <tr>
            <td>
                <img src="${banner.image_url}" alt="${banner.title}" class="banner-thumbnail">
            </td>
            <td>
                <strong>${banner.title}</strong><br>
                <small>${banner.subtitle || ''}</small>
            </td>
            <td>${banner.link_url || '-'}</td>
            <td>${banner.display_order}</td>
            <td>
                <span class="badge ${banner.is_active == 1 ? 'badge-success' : 'badge-danger'}">
                    ${banner.is_active == 1 ? 'Aktif' : 'Pasif'}
                </span>
            </td>
            <td>
                <small>
                    ${banner.start_date ? new Date(banner.start_date).toLocaleDateString('tr-TR') : '-'}<br>
                    ${banner.end_date ? new Date(banner.end_date).toLocaleDateString('tr-TR') : '-'}
                </small>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="editBanner(${banner.id})">Düzenle</button>
                    <button class="btn btn-danger" onclick="deleteBanner(${banner.id})">Sil</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Modal aç
 */
function openModal() {
    document.getElementById('modalTitle').textContent = 'Yeni Banner Ekle';
    document.getElementById('bannerForm').reset();
    document.getElementById('bannerId').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imageUrl').value = '';
    document.getElementById('backgroundColor').value = '#1E88E5';
    document.getElementById('textColor').value = '#FFFFFF';
    document.getElementById('isActive').checked = true;
    document.getElementById('bannerModal').style.display = 'block';
}

/**
 * Modal kapat
 */
function closeModal() {
    document.getElementById('bannerModal').style.display = 'none';
}

/**
 * Görsel önizleme
 */
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Banner formu gönder
 */
document.getElementById('bannerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const bannerId = document.getElementById('bannerId').value;
    const imageFile = document.getElementById('imageFile').files[0];
    let imageUrl = document.getElementById('imageUrl').value;
    
    // Eğer yeni dosya seçildiyse önce yükle
    if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
            showError('Görsel yüklenemedi');
            return;
        }
    }
    
    if (!imageUrl) {
        showError('Lütfen bir görsel seçin');
        return;
    }
    
    const bannerData = {
        title: document.getElementById('title').value,
        subtitle: document.getElementById('subtitle').value,
        image_url: imageUrl,
        link_url: document.getElementById('linkUrl').value,
        link_text: document.getElementById('linkText').value,
        background_color: document.getElementById('backgroundColor').value,
        text_color: document.getElementById('textColor').value,
        display_order: parseInt(document.getElementById('displayOrder').value),
        is_active: document.getElementById('isActive').checked ? 1 : 0,
        start_date: document.getElementById('startDate').value || null,
        end_date: document.getElementById('endDate').value || null
    };
    
    const method = bannerId ? 'PUT' : 'POST';
    const url = bannerId ? `${API_BASE}/${bannerId}` : API_BASE;
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bannerData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal();
            loadBanners();
            showSuccess(bannerId ? 'Banner güncellendi' : 'Banner eklendi');
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
 * Görsel yükle
 */
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.url;
        }
        return null;
    } catch (error) {
        console.error('Upload error:', error);
        return null;
    }
}

/**
 * Banner düzenle
 */
function editBanner(id) {
    fetch(`${API_BASE}/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const banner = data.data;
                
                document.getElementById('modalTitle').textContent = 'Banner Düzenle';
                document.getElementById('bannerId').value = banner.id;
                document.getElementById('title').value = banner.title;
                document.getElementById('subtitle').value = banner.subtitle || '';
                document.getElementById('imageUrl').value = banner.image_url;
                document.getElementById('linkUrl').value = banner.link_url || '';
                document.getElementById('linkText').value = banner.link_text || '';
                document.getElementById('backgroundColor').value = banner.background_color;
                document.getElementById('textColor').value = banner.text_color;
                document.getElementById('displayOrder').value = banner.display_order;
                document.getElementById('isActive').checked = banner.is_active == 1;
                
                if (banner.start_date) {
                    document.getElementById('startDate').value = banner.start_date.replace(' ', 'T');
                }
                if (banner.end_date) {
                    document.getElementById('endDate').value = banner.end_date.replace(' ', 'T');
                }
                
                const preview = document.getElementById('imagePreview');
                preview.src = banner.image_url;
                preview.style.display = 'block';
                
                document.getElementById('bannerModal').style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Banner yüklenemedi');
        });
}

/**
 * Banner sil
 */
function deleteBanner(id) {
    if (!confirm('Bu banner\'ı silmek istediğinize emin misiniz?')) {
        return;
    }
    
    fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadBanners();
            showSuccess('Banner silindi');
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
    const modal = document.getElementById('bannerModal');
    if (event.target === modal) {
        closeModal();
    }
};
