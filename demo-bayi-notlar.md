# Demo Bayi Kullanıcısı

**IMPORTANT**: Demo bayi kullanıcısı Supabase Authentication'da manuel oluşturulmalı.

## Kullanıcı Bilgileri:
- **Email**: abc@oyuncak.com
- **Password**: DemoB@yi123
- **Şirket**: ABC Oyuncak
- **Tip**: B2B Bayi

## SQL ile Demo Veri Ekleme:
Kullanıcı oluşturulduktan sonra aşağıdaki SQL'i çalıştırın:

```sql
-- User ID'yi al
SELECT id, email FROM auth.users WHERE email = 'abc@oyuncak.com';

-- Profile güncelle (user_id'yi yukarıdan alınan ile değiştir)
UPDATE profiles 
SET 
    customer_type = 'B2B',
    dealer_company_name = 'ABC Oyuncak',
    dealer_approved = true,
    dealer_approval_date = NOW(),
    balance = 2450.00,
    vip_level = 3,
    loyalty_points = 750,
    full_name = 'ABC Oyuncak Bayisi'
WHERE user_id = 'USER_ID_BURAYA';
```
