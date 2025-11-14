# B2B Bayi Panel - Kalan İşlemler

## Tamamlanan:
✅ Database şeması (balance_transactions, dealer fields)
✅ Database fonksiyonları (update_user_balance)
✅ Edge Functions (bayi-dashboard, bayi-balance)
✅ BayiLoginPage frontend

## Kalan (User tamamlayabilir):

### Frontend Pages:
1. BayiLayout.tsx - Sidebar navigation
2. BayiDashboard.tsx - Ana dashboard (istatistikler)
3. BayiBakiye.tsx - Bakiye yönetimi sayfası
4. BayiSiparisler.tsx - Sipariş geçmişi
5. BayiAyarlar.tsx - Profil ayarları

### Routes (App.tsx):
```tsx
import BayiLoginPage from './pages/bayi/BayiLoginPage'
import BayiDashboard from './pages/bayi/BayiDashboard'
// ... diğer import'lar

<Route path="/bayi" element={<BayiLoginPage />} />
<Route path="/bayi/dashboard" element={<BayiLayout><BayiDashboard /></BayiLayout>} />
<Route path="/bayi/bakiye" element={<BayiLayout><BayiBakiye /></BayiLayout>} />
<Route path="/bayi/siparisler" element={<BayiLayout><BayiSiparisler /></BayiLayout>} />
<Route path="/bayi/ayarlar" element={<BayiLayout><BayiAyarlar /></BayiLayout>} />
```

### Header Update:
Header.tsx'e "Bayi Girişi" butonu ekle:
```tsx
<Link to="/bayi" className="text-gray-600 hover:text-blue-700">
  <Store size={20} /> Bayi Girişi
</Link>
```

### Demo User Oluşturma:
Supabase Dashboard → Authentication → Users → Create User:
- Email: abc@oyuncak.com
- Password: DemoB@yi123

Sonra SQL:
```sql
UPDATE profiles SET 
  customer_type = 'B2B',
  dealer_company_name = 'ABC Oyuncak',
  dealer_approved = true,
  balance = 2450.00,
  vip_level = 3
WHERE user_id = 'USER_ID';
```

### Edge Functions Deploy:
```bash
supabase functions deploy bayi-dashboard
supabase functions deploy bayi-balance
```

## Component Tasarım Rehberi:

### BayiDashboard:
- 4 stat card (Bakiye, Bu Ay Yükleme, Bu Ay Harcama, İşlem Sayısı)
- VIP seviye gösterimi
- Son işlemler tablosu
- Hızlı eylemler (Bakiye Yükle butonu)

### BayiBakiye:
- Bakiye özeti
- Bakiye yükleme formu
- İşlem geçmişi (pagination)
- Filtreler (tarih, tip)

Color Scheme: Mavi tonlar (admin ile uyumlu)
- Primary: blue-700
- Accent: blue-600
- Background: gray-50
