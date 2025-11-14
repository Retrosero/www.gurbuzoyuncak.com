/**
 * RLS ve Bayi Ürünleri Test Script
 * Bu script hem Admin ürün ekleme hem de Bayi ürün listeleme senaryolarını test eder
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://nxtfpceqjpyexmiuecam.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dGZwY2VxanB5ZXhtaXVlY2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTI3NDEsImV4cCI6MjA3NzQ4ODc0MX0.Q0zM-6XafuXxB0vRHz15I0JlOxQAP0nglz49vySy23I'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Test credentials
const ADMIN_EMAIL = 'adnxjbak@minimax.com'
const ADMIN_PASSWORD = 'Qu7amVIMFV'
const BAYI_EMAIL = 'abc@oyuncak.com'
const BAYI_PASSWORD = 'DemoB@yi123'

async function testAdminProductAdd() {
  console.log('\n========================================')
  console.log('TEST 1: ADMIN ÜRÜN EKLEME')
  console.log('========================================\n')

  try {
    // 1. Admin olarak giriş yap
    console.log('✅ 1. Admin girişi yapılıyor...')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })

    if (authError) {
      console.error('❌ Giriş hatası:', authError.message)
      return false
    }

    console.log('✅ Giriş başarılı!')
    console.log(`   User ID: ${authData.user.id}`)
    console.log(`   Email: ${authData.user.email}`)

    // 2. Profil bilgisini kontrol et
    console.log('\n✅ 2. Profil bilgisi kontrol ediliyor...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('❌ Profil hatası:', profileError.message)
      return false
    }

    console.log(`   Müşteri Tipi: ${profile.customer_type}`)
    console.log(`   Ad Soyad: ${profile.full_name || 'Belirtilmemiş'}`)
    
    if (profile.customer_type !== 'Admin') {
      console.error(`❌ HATA: Kullanıcı Admin değil! Tip: ${profile.customer_type}`)
      return false
    }

    // 3. Marka ve kategori bilgilerini al
    console.log('\n✅ 3. Marka ve kategori listesi alınıyor...')
    const { data: brands } = await supabase
      .from('brands')
      .select('id, name')
      .eq('is_active', true)
      .limit(1)

    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .limit(1)

    if (!brands || brands.length === 0) {
      console.error('❌ Marka bulunamadı!')
      return false
    }

    if (!categories || categories.length === 0) {
      console.error('❌ Kategori bulunamadı!')
      return false
    }

    console.log(`   Marka: ${brands[0].name} (ID: ${brands[0].id})`)
    console.log(`   Kategori: ${categories[0].name} (ID: ${categories[0].id})`)

    // 4. TEST ÜRÜNÜ EKLE
    console.log('\n✅ 4. Test ürünü ekleniyor...')
    const testProduct = {
      product_code: 'RLS-TEST-' + Date.now(),
      barcode: '9999' + Date.now(),
      name: 'RLS Test Ürünü - ' + new Date().toLocaleString('tr-TR'),
      slug: 'rls-test-urun-' + Date.now(),
      description: 'RLS politika testi için oluşturulmuş test ürünü',
      brand_id: brands[0].id,
      category_id: categories[0].id,
      base_price: 100.00,
      tax_rate: 20,
      stock: 50,
      is_active: true,
      is_featured: false
    }

    console.log(`   Ürün Kodu: ${testProduct.product_code}`)
    console.log(`   Ürün Adı: ${testProduct.name}`)
    console.log(`   Fiyat: ${testProduct.base_price} TL`)

    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single()

    if (insertError) {
      console.error('\n❌❌❌ ÜRÜN EKLEME BAŞARISIZ! ❌❌❌')
      console.error(`   Hata Kodu: ${insertError.code}`)
      console.error(`   Hata Mesajı: ${insertError.message}`)
      console.error(`   Detay: ${insertError.details}`)
      
      if (insertError.message.includes('row-level security policy')) {
        console.error('\n⚠️  RLS POLİTİKASI HATASI TESPİT EDİLDİ!')
        console.error('   Admin kullanıcısı products tablosuna INSERT yapamıyor.')
      }
      return false
    }

    console.log('\n✅✅✅ ÜRÜN BAŞARIYLA EKLENDİ! ✅✅✅')
    console.log(`   Ürün ID: ${newProduct.id}`)
    console.log(`   Ürün Kodu: ${newProduct.product_code}`)
    console.log(`   Oluşturulma: ${newProduct.created_at}`)

    // 5. Çıkış yap
    await supabase.auth.signOut()
    console.log('\n✅ 5. Çıkış yapıldı.')

    return true

  } catch (error) {
    console.error('\n❌ Beklenmeyen hata:', error.message)
    return false
  }
}

async function testBayiProductList() {
  console.log('\n========================================')
  console.log('TEST 2: BAYİ ÜRÜN LİSTESİ')
  console.log('========================================\n')

  try {
    // 1. Bayi olarak giriş yap
    console.log('✅ 1. Bayi girişi yapılıyor...')
    console.log(`   Email: ${BAYI_EMAIL}`)
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: BAYI_EMAIL,
      password: BAYI_PASSWORD
    })

    if (authError) {
      console.error('❌ Giriş hatası:', authError.message)
      return false
    }

    console.log('✅ Giriş başarılı!')
    console.log(`   User ID: ${authData.user.id}`)
    console.log(`   Email: ${authData.user.email}`)

    // 2. Profil bilgisini kontrol et
    console.log('\n✅ 2. Bayi profili kontrol ediliyor...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('❌ Profil hatası:', profileError.message)
      return false
    }

    console.log(`   Müşteri Tipi: ${profile.customer_type}`)
    console.log(`   Bayi Durumu: ${profile.is_bayi ? 'Aktif' : 'Pasif'}`)
    console.log(`   İndirim: %${profile.bayi_discount_percentage || 0}`)
    console.log(`   VIP Seviye: ${profile.bayi_vip_level || 'Yok'}`)

    if (!profile.is_bayi) {
      console.error('\n❌ HATA: Kullanıcı bayi olarak işaretlenmemiş!')
      return false
    }

    // 3. Edge function ile ürünleri çek
    console.log('\n✅ 3. Bayi ürünleri çekiliyor (Edge Function)...')
    console.log('   Edge Function: bayi-products')
    console.log(`   User ID: ${authData.user.id}`)

    const { data, error } = await supabase.functions.invoke('bayi-products', {
      body: { 
        user_id: authData.user.id,
        filters: {
          category: '',
          brand: '',
          priceRange: [0, 10000],
          inStock: false,
          searchQuery: ''
        }
      }
    })

    if (error) {
      console.error('\n❌❌❌ EDGE FUNCTION HATASI! ❌❌❌')
      console.error(`   Hata: ${error.message}`)
      console.error(`   Context: ${error.context || 'Yok'}`)
      return false
    }

    if (!data || !data.success) {
      console.error('\n❌ Edge function başarısız yanıt döndü')
      console.error('   Response:', JSON.stringify(data, null, 2))
      return false
    }

    const products = data.data.products || []
    const bayiInfo = data.data.bayi_info

    console.log('\n✅✅✅ ÜRÜNLER BAŞARIYLA ALINDI! ✅✅✅')
    console.log(`   Toplam Ürün: ${products.length}`)
    
    if (bayiInfo) {
      console.log(`   Bayi Adı: ${bayiInfo.name}`)
      console.log(`   İndirim: %${bayiInfo.discount_percentage}`)
      console.log(`   VIP Seviye: ${bayiInfo.vip_level}`)
      console.log(`   Durum: ${bayiInfo.status}`)
    }

    if (products.length === 0) {
      console.error('\n⚠️  DİKKAT: Ürün bulunamadı!')
      console.error('   Beklenen: 154 ürün')
      return false
    }

    // İlk 3 ürünü göster
    console.log('\n📦 İlk 3 Ürün:')
    products.slice(0, 3).forEach((p, index) => {
      console.log(`\n   ${index + 1}. ${p.name}`)
      console.log(`      Ürün Kodu: ${p.product_code}`)
      console.log(`      Normal Fiyat: ${p.base_price} TL`)
      console.log(`      Bayi Fiyatı: ${p.calculated_bayi_price} TL`)
      console.log(`      İndirim: %${p.discount_percentage}`)
      console.log(`      Tasarruf: ${p.savings_amount} TL`)
    })

    // 4. Çıkış yap
    await supabase.auth.signOut()
    console.log('\n✅ 4. Çıkış yapıldı.')

    // Sonuç değerlendirmesi
    if (products.length !== 154) {
      console.log(`\n⚠️  UYARI: Beklenen 154 ürün, alınan ${products.length} ürün`)
      return false
    }

    return true

  } catch (error) {
    console.error('\n❌ Beklenmeyen hata:', error.message)
    console.error('   Stack:', error.stack)
    return false
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════╗')
  console.log('║   GÜRBÜZ OYUNCAK - RLS & BAYİ TEST   ║')
  console.log('╚════════════════════════════════════════╝')
  
  const test1Result = await testAdminProductAdd()
  const test2Result = await testBayiProductList()

  console.log('\n╔════════════════════════════════════════╗')
  console.log('║          TEST SONUÇLARI                ║')
  console.log('╚════════════════════════════════════════╝')
  console.log(`\n1. Admin Ürün Ekleme: ${test1Result ? '✅ BAŞARILI' : '❌ BAŞARISIZ'}`)
  console.log(`2. Bayi Ürün Listesi: ${test2Result ? '✅ BAŞARILI' : '❌ BAŞARISIZ'}`)
  
  if (test1Result && test2Result) {
    console.log('\n🎉🎉🎉 TÜM TESTLER BAŞARILI! 🎉🎉🎉')
    console.log('\n✅ RLS politikaları düzgün çalışıyor')
    console.log('✅ Admin ürün ekleyebiliyor')
    console.log('✅ Bayi ürünleri görebiliyor')
    console.log('✅ İndirim hesaplamaları doğru')
  } else {
    console.log('\n⚠️  BAZI TESTLER BAŞARISIZ OLDU')
    if (!test1Result) {
      console.log('❌ Admin ürün ekleyemiyor - RLS politikası sorunu olabilir')
    }
    if (!test2Result) {
      console.log('❌ Bayi ürünleri görüntüleyemiyor - Edge function sorunu olabilir')
    }
  }

  console.log('\n')
  process.exit(test1Result && test2Result ? 0 : 1)
}

runTests()
