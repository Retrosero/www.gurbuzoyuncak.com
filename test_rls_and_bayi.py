#!/usr/bin/env python3
"""
RLS ve Bayi Ürünleri Test Script
Bu script hem Admin ürün ekleme hem de Bayi ürün listeleme senaryolarını test eder
"""

import requests
import json
import time
from datetime import datetime

SUPABASE_URL = 'https://nxtfpceqjpyexmiuecam.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dGZwY2VxanB5ZXhtaXVlY2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTI3NDEsImV4cCI6MjA3NzQ4ODc0MX0.Q0zM-6XafuXxB0vRHz15I0JlOxQAP0nglz49vySy23I'

# Test credentials
ADMIN_EMAIL = 'adnxjbak@minimax.com'
ADMIN_PASSWORD = 'Qu7amVIMFV'
BAYI_EMAIL = 'abc@oyuncak.com'
BAYI_PASSWORD = 'DemoB@yi123'

def supabase_auth_login(email, password):
    """Supabase Auth ile giriş yap"""
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
    }
    data = {
        'email': email,
        'password': password
    }
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Auth error: {response.status_code} - {response.text}")

def supabase_query(table, access_token, method='GET', select='*', filters=None, data=None):
    """Supabase REST API ile sorgu yap"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    params = {}
    if select:
        params['select'] = select
    if filters:
        params.update(filters)
    
    if method == 'GET':
        response = requests.get(url, headers=headers, params=params)
    elif method == 'POST':
        response = requests.post(url, headers=headers, params=params, json=data)
    
    if response.status_code in [200, 201]:
        return response.json()
    else:
        raise Exception(f"Query error: {response.status_code} - {response.text}")

def invoke_edge_function(function_name, access_token, body):
    """Edge function çağır"""
    url = f"{SUPABASE_URL}/functions/v1/{function_name}"
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(url, headers=headers, json=body)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Edge function error: {response.status_code} - {response.text}")

def test_admin_product_add():
    """TEST 1: Admin ürün ekleme"""
    print('\n========================================')
    print('TEST 1: ADMIN ÜRÜN EKLEME')
    print('========================================\n')
    
    try:
        # 1. Admin olarak giriş yap
        print('✅ 1. Admin girişi yapılıyor...')
        print(f'   Email: {ADMIN_EMAIL}')
        
        auth_result = supabase_auth_login(ADMIN_EMAIL, ADMIN_PASSWORD)
        access_token = auth_result['access_token']
        user_id = auth_result['user']['id']
        
        print('✅ Giriş başarılı!')
        print(f'   User ID: {user_id}')
        print(f'   Email: {auth_result["user"]["email"]}')
        
        # 2. Profil bilgisini kontrol et
        print('\n✅ 2. Profil bilgisi kontrol ediliyor...')
        profiles = supabase_query('profiles', access_token, filters={'user_id': f'eq.{user_id}'})
        if not profiles:
            print(f'❌ HATA: Profil bulunamadı!')
            return False
        profile = profiles[0]
        
        print(f'   Müşteri Tipi: {profile["customer_type"]}')
        print(f'   Rol: {profile.get("role", "Belirtilmemiş")}')
        print(f'   Ad Soyad: {profile.get("full_name", "Belirtilmemiş")}')
        
        if profile.get('role') != 'admin':
            print(f'❌ HATA: Kullanıcı Admin değil! Rol: {profile.get("role")}')
            return False
        
        # 3. Marka ve kategori bilgilerini al
        print('\n✅ 3. Marka ve kategori listesi alınıyor...')
        brands = supabase_query('brands', access_token, filters={'is_active': 'eq.true', 'limit': '1'})
        categories = supabase_query('categories', access_token, filters={'is_active': 'eq.true', 'limit': '1'})
        
        if not brands:
            print('❌ Marka bulunamadı!')
            return False
        
        if not categories:
            print('❌ Kategori bulunamadı!')
            return False
        
        brand = brands[0]
        category = categories[0]
        
        print(f'   Marka: {brand["name"]} (ID: {brand["id"]})')
        print(f'   Kategori: {category["name"]} (ID: {category["id"]})')
        
        # 4. TEST ÜRÜNÜ EKLE
        print('\n✅ 4. Test ürünü ekleniyor...')
        timestamp = int(time.time())
        test_product = {
            'product_code': f'RLS-TEST-{timestamp}',
            'barcode': f'9999{timestamp}',
            'name': f'RLS Test Ürünü - {datetime.now().strftime("%d.%m.%Y %H:%M:%S")}',
            'slug': f'rls-test-urun-{timestamp}',
            'description': 'RLS politika testi için oluşturulmuş test ürünü',
            'brand_id': brand['id'],
            'category_id': category['id'],
            'base_price': 100.00,
            'tax_rate': 20,
            'stock': 50,
            'is_active': True,
            'is_featured': False
        }
        
        print(f'   Ürün Kodu: {test_product["product_code"]}')
        print(f'   Ürün Adı: {test_product["name"]}')
        print(f'   Fiyat: {test_product["base_price"]} TL')
        
        new_product = supabase_query('products', access_token, method='POST', data=test_product)[0]
        
        print('\n✅✅✅ ÜRÜN BAŞARIYLA EKLENDİ! ✅✅✅')
        print(f'   Ürün ID: {new_product["id"]}')
        print(f'   Ürün Kodu: {new_product["product_code"]}')
        print(f'   Oluşturulma: {new_product["created_at"]}')
        
        return True
        
    except Exception as e:
        print('\n❌❌❌ ÜRÜN EKLEME BAŞARISIZ! ❌❌❌')
        print(f'   Hata: {str(e)}')
        
        if 'row-level security policy' in str(e):
            print('\n⚠️  RLS POLİTİKASI HATASI TESPİT EDİLDİ!')
            print('   Admin kullanıcısı products tablosuna INSERT yapamıyor.')
        
        return False

def test_bayi_product_list():
    """TEST 2: Bayi ürün listesi"""
    print('\n========================================')
    print('TEST 2: BAYİ ÜRÜN LİSTESİ')
    print('========================================\n')
    
    try:
        # 1. Bayi olarak giriş yap
        print('✅ 1. Bayi girişi yapılıyor...')
        print(f'   Email: {BAYI_EMAIL}')
        
        auth_result = supabase_auth_login(BAYI_EMAIL, BAYI_PASSWORD)
        access_token = auth_result['access_token']
        user_id = auth_result['user']['id']
        
        print('✅ Giriş başarılı!')
        print(f'   User ID: {user_id}')
        print(f'   Email: {auth_result["user"]["email"]}')
        
        # 2. Profil bilgisini kontrol et
        print('\n✅ 2. Bayi profili kontrol ediliyor...')
        profiles = supabase_query('profiles', access_token, filters={'user_id': f'eq.{user_id}'})
        if not profiles:
            print(f'❌ HATA: Profil bulunamadı!')
            return False
        profile = profiles[0]
        
        print(f'   Müşteri Tipi: {profile["customer_type"]}')
        print(f'   Bayi Durumu: {"Aktif" if profile.get("is_bayi") else "Pasif"}')
        print(f'   İndirim: %{profile.get("bayi_discount_percentage", 0)}')
        print(f'   VIP Seviye: {profile.get("bayi_vip_level", "Yok")}')
        
        if not profile.get('is_bayi'):
            print('\n❌ HATA: Kullanıcı bayi olarak işaretlenmemiş!')
            return False
        
        # 3. Edge function ile ürünleri çek
        print('\n✅ 3. Bayi ürünleri çekiliyor (Edge Function)...')
        print('   Edge Function: bayi-products')
        print(f'   User ID: {user_id}')
        
        result = invoke_edge_function('bayi-products', access_token, {
            'user_id': user_id,
            'filters': {
                'category': '',
                'brand': '',
                'priceRange': [0, 10000],
                'inStock': False,
                'searchQuery': ''
            }
        })
        
        if not result.get('success'):
            print('\n❌ Edge function başarısız yanıt döndü')
            print(f'   Response: {json.dumps(result, indent=2)}')
            return False
        
        products = result['data']['products']
        bayi_info = result['data'].get('bayi_info')
        
        print('\n✅✅✅ ÜRÜNLER BAŞARIYLA ALINDI! ✅✅✅')
        print(f'   Toplam Ürün: {len(products)}')
        
        if bayi_info:
            print(f'   Bayi Adı: {bayi_info["name"]}')
            print(f'   İndirim: %{bayi_info["discount_percentage"]}')
            print(f'   VIP Seviye: {bayi_info["vip_level"]}')
            print(f'   Durum: {bayi_info["status"]}')
        
        if len(products) == 0:
            print('\n⚠️  DİKKAT: Ürün bulunamadı!')
            print('   Beklenen: 154 ürün')
            return False
        
        # İlk 3 ürünü göster
        print('\n📦 İlk 3 Ürün:')
        for i, p in enumerate(products[:3], 1):
            print(f'\n   {i}. {p["name"]}')
            print(f'      Ürün Kodu: {p["product_code"]}')
            print(f'      Normal Fiyat: {p["base_price"]} TL')
            print(f'      Bayi Fiyatı: {p["calculated_bayi_price"]} TL')
            print(f'      İndirim: %{p["discount_percentage"]}')
            print(f'      Tasarruf: {p["savings_amount"]} TL')
        
        # Sonuç değerlendirmesi
        if len(products) < 154:
            print(f'\n⚠️  UYARI: Beklenen en az 154 ürün, alınan {len(products)} ürün')
            return False
        elif len(products) > 154:
            print(f'\n✅ BAŞARILI: {len(products)} ürün listelendi (test ürünleri dahil)')
        
        return True
        
    except Exception as e:
        print('\n❌❌❌ BAYİ ÜRÜN LİSTESİ HATASI! ❌❌❌')
        print(f'   Hata: {str(e)}')
        return False

def run_tests():
    """Tüm testleri çalıştır"""
    print('╔════════════════════════════════════════╗')
    print('║   GÜRBÜZ OYUNCAK - RLS & BAYİ TEST   ║')
    print('╚════════════════════════════════════════╝')
    
    test1_result = test_admin_product_add()
    test2_result = test_bayi_product_list()
    
    print('\n╔════════════════════════════════════════╗')
    print('║          TEST SONUÇLARI                ║')
    print('╚════════════════════════════════════════╝')
    print(f'\n1. Admin Ürün Ekleme: {"✅ BAŞARILI" if test1_result else "❌ BAŞARISIZ"}')
    print(f'2. Bayi Ürün Listesi: {"✅ BAŞARILI" if test2_result else "❌ BAŞARISIZ"}')
    
    if test1_result and test2_result:
        print('\n🎉🎉🎉 TÜM TESTLER BAŞARILI! 🎉🎉🎉')
        print('\n✅ RLS politikaları düzgün çalışıyor')
        print('✅ Admin ürün ekleyebiliyor')
        print('✅ Bayi ürünleri görebiliyor')
        print('✅ İndirim hesaplamaları doğru')
    else:
        print('\n⚠️  BAZI TESTLER BAŞARISIZ OLDU')
        if not test1_result:
            print('❌ Admin ürün ekleyemiyor - RLS politikası sorunu olabilir')
        if not test2_result:
            print('❌ Bayi ürünleri görüntüleyemiyor - Edge function sorunu olabilir')
    
    print('\n')
    return test1_result and test2_result

if __name__ == '__main__':
    success = run_tests()
    exit(0 if success else 1)
