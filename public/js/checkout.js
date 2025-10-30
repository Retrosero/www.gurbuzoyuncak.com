// Sepet sayfasındaki checkout fonksiyonunu güncelle
async function proceedToCheckout() {
    // Oturum kontrolü
    try {
        const response = await fetch('../backend/api/users.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({action: 'check_session'})
        });
        
        const data = await response.json();
        
        if (!data.logged_in) {
            if (confirm('Sipariş vermek için giriş yapmanız gerekiyor. Giriş sayfasına yönlendirilmek ister misiniz?')) {
                window.location.href = 'auth.html?redirect=checkout';
            }
            return;
        }
        
        // Sipariş oluştur
        const items = cart.getItems();
        if (items.length === 0) {
            alert('Sepetiniz boş!');
            return;
        }
        
        const subtotal = cart.getTotal();
        const freeShippingThreshold = 500;
        const shippingCost = subtotal >= freeShippingThreshold ? 0 : 50;
        const total = subtotal + shippingCost;
        
        // Sipariş kalemleri
        const orderItems = items.map(item => ({
            product_id: item.id,
            product_name: item.name,
            product_sku: item.slug,
            quantity: item.quantity,
            price: item.price
        }));
        
        const orderData = {
            items: orderItems,
            subtotal: subtotal,
            shipping_cost: shippingCost,
            tax: 0,
            discount: 0,
            total: total,
            payment_method: 'cash_on_delivery',
            notes: ''
        };
        
        const orderResponse = await fetch('../backend/api/orders.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(orderData)
        });
        
        const orderResult = await orderResponse.json();
        
        if (orderResult.success) {
            // Sepeti temizle
            cart.clear();
            
            // Başarı mesajı
            alert(`Siparişiniz başarıyla oluşturuldu!\n\nSipariş Numarası: ${orderResult.order_number}\n\nSiparişinizi hesabım sayfasından takip edebilirsiniz.`);
            
            // Hesabım sayfasına yönlendir
            window.location.href = 'account.html?tab=orders';
        } else {
            alert('Sipariş oluşturulamadı: ' + (orderResult.error || 'Bilinmeyen hata'));
        }
        
    } catch (error) {
        console.error('Checkout hatası:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
}
