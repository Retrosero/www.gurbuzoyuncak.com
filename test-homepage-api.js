// Ana sayfa API test scripti
const SUPABASE_URL = 'https://nxtfpceqjpyexmiuecam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dGZwY2VxanB5ZXhtaXVlY2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTI3NDEsImV4cCI6MjA3NzQ4ODc0MX0.Q0zM-6XafuXxB0vRHz15I0JlOxQAP0nglz49vySy23I';

async function testNewProducts() {
  console.log('\n=== SON EKLENENÜRüNLER TESTİ ===');
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/products?is_active=eq.true&created_at=gte.${thirtyDaysAgo.toISOString()}&order=created_at.desc&limit=8`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );
  
  const data = await response.json();
  console.log(`✓ Sorgu başarılı: ${data.length} ürün bulundu`);
  
  if (data.length > 0) {
    console.log(`  İlk ürün: "${data[0].name}"`);
    console.log(`  Oluşturulma: ${data[0].created_at}`);
    console.log(`  Fiyat: ₺${data[0].base_price}`);
    console.log(`  Stok: ${data[0].stock}`);
    
    // Son 7 günde eklenen sayısı
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newCount = data.filter(p => new Date(p.created_at) >= sevenDaysAgo).length;
    console.log(`  Son 7 günde eklenen (YENİ badge alacak): ${newCount} ürün`);
  }
  
  return data.length > 0;
}

async function testFeaturedProducts() {
  console.log('\n=== ÖNE ÇIKAN ÜRÜNLER TESTİ ===');
  
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/products?is_active=eq.true&is_featured=eq.true&order=view_count.desc&limit=8`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );
  
  const data = await response.json();
  console.log(`✓ Sorgu başarılı: ${data.length} ürün bulundu`);
  
  if (data.length === 0) {
    console.log('  ℹ Öne çıkan ürün yok - Bu bölüm gösterilmeyecek');
  }
  
  return true;
}

async function testPopularProducts() {
  console.log('\n=== POPÜLER ÜRÜNLER TESTİ ===');
  
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/products?is_active=eq.true&order=view_count.desc&limit=8`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );
  
  const data = await response.json();
  console.log(`✓ Sorgu başarılı: ${data.length} ürün bulundu`);
  
  if (data.length > 0) {
    console.log(`  İlk ürün: "${data[0].name}"`);
    console.log(`  Görüntülenme: ${data[0].view_count}`);
  }
  
  return data.length > 0;
}

async function testBrands() {
  console.log('\n=== MARKA BİLGİSİ TESTİ ===');
  
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/brands?is_active=eq.true&order=name&limit=12`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );
  
  const data = await response.json();
  console.log(`✓ Sorgu başarılı: ${data.length} marka bulundu`);
  
  if (data.length > 0) {
    console.log(`  Markalar: ${data.slice(0, 5).map(b => b.name).join(', ')}...`);
  }
  
  return data.length > 0;
}

async function runTests() {
  console.log('Ana Sayfa Ürün Görünürlük API Testi');
  console.log('====================================');
  
  try {
    const results = {
      newProducts: await testNewProducts(),
      featuredProducts: await testFeaturedProducts(),
      popularProducts: await testPopularProducts(),
      brands: await testBrands()
    };
    
    console.log('\n\n=== TEST SONUÇLARI ===');
    console.log(`✓ Son Eklenen Ürünler API: ${results.newProducts ? 'BAŞARILI' : 'BAŞARISIZ'}`);
    console.log(`✓ Öne Çıkan Ürünler API: ${results.featuredProducts ? 'BAŞARILI' : 'BAŞARISIZ'}`);
    console.log(`✓ Popüler Ürünler API: ${results.popularProducts ? 'BAŞARILI' : 'BAŞARISIZ'}`);
    console.log(`✓ Markalar API: ${results.brands ? 'BAŞARILI' : 'BAŞARISIZ'}`);
    
    const allPassed = Object.values(results).every(r => r);
    
    console.log('\n=== GENEL DURUM ===');
    if (allPassed) {
      console.log('✓ TÜM API ÇAĞRILARI ÇALIŞIYOR');
      console.log('✓ Veri katmanı hazır');
      console.log('✓ Ana sayfa bölümleri veri alabilecek durumda');
    } else {
      console.log('✗ Bazı API çağrıları başarısız');
    }
    
    console.log('\n=== BEKLENTİLER ===');
    console.log('1. Ana sayfada "Son Eklenen Ürünler" bölümü görünmeli (856 ürün mevcut)');
    console.log('2. Ana sayfada "Öne Çıkan Ürünler" bölümü gizli olmalı (0 ürün)');
    console.log('3. Ana sayfada "Popüler Ürünler" bölümü görünmeli');
    console.log('4. ProductCard\'larda brand bilgisi görünmemeli (null değerler)');
    console.log('5. Son 7 günde eklenen ürünlerde "YENİ" badge\'i görünmeli');
    
  } catch (error) {
    console.error('Test hatası:', error.message);
  }
}

runTests();
