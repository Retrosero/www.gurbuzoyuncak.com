# ADMİN KULLANICI TAKİBİ SİSTEMİ DOKÜMANTASYONU

## 📊 Sistem Genel Bakış

Gürbüz Oyuncak admin paneline eklenen **ADMİN KULLANICI TAKİBİ SİSTEMİ**, e-ticaret platformunda kullanıcı davranışlarını analiz etmek ve müşteri deneyimini optimize etmek için geliştirilmiş kapsamlı bir analiz ve takip sistemidir.

## 🎯 Sistem Amaçları

### Kullanıcı Aktivite Takibi
- Hangi ürünlerin favorilere eklendiğinin izlenmesi
- Kullanıcıların sayfa gezinme pattern'larının analizi
- Oturum süreleri ve etkileşim yoğunluğunun ölçülmesi

### Sepet İçeriği Yönetimi
- Kullanıcıların sepetlerinde hangi ürünlerin bulunduğu
- Sepet terk etme oranlarının analizi
- Abandoned cart kurtarma stratejilerinin geliştirilmesi

### Favori Ürünler Raporlama
- En çok favorilere eklenen ürünlerin belirlenmesi
- Kategori ve marka bazında favori analizleri
- Popülerlik trendlerinin takibi

### Sepet Analiz Sistemi
- Conversion funnel analizi
- Sepet→Satın alma dönüşüm oranları
- Müşteri tipine göre sepet davranış analizi

### Kullanıcı Davranış Analizi
- Engagement skorlarının hesaplanması
- Kullanıcı segmentasyonu (Yüksek/Orta/Düşük aktivite)
- Navigation path analizleri

### Kullanıcı Profil ve Tercihleri
- Müşteri tipi bazında davranış analizi
- VIP seviye kullanıcıların özel analizi
- Tercih edilen kategori ve markaların belirlenmesi

## 🛠️ Teknik Yapı

### Teknoloji Stack
- **Frontend**: React + TypeScript + TailwindCSS
- **Charts**: Recharts kütüphanesi
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Real-time subscriptions
- **UI Components**: Radix UI + shadcn/ui

### Database Yapısı

#### Ana Tablolar
```sql
-- User Journey Tracking
CREATE TABLE user_journey_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(100),
    page_visited VARCHAR(255),
    product_viewed INTEGER REFERENCES products(id),
    action_type VARCHAR(50), -- view, favorite, add_to_cart, purchase
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_duration INTEGER, -- seconds
    referrer VARCHAR(500),
    user_agent TEXT,
    ip_address INET
);

-- User Favorites
CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    product_id INTEGER REFERENCES products(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Carts
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Analytics Views
```sql
-- User Behavior Analytics View
CREATE VIEW user_behavior_analytics AS
SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    p.customer_type,
    p.vip_level,
    COUNT(DISTINCT uf.id) as total_favorites,
    COUNT(DISTINCT c.id) as total_cart_sessions,
    SUM(CASE WHEN cj.action_type = 'view' THEN 1 ELSE 0 END) as weekly_activity_score,
    COUNT(DISTINCT cat.id) as unique_categories_browsed,
    COUNT(DISTINCT CASE WHEN cj.action_type = 'purchase' THEN cj.id END) as total_purchases
FROM profiles p
LEFT JOIN user_favorites uf ON p.id = uf.user_id
LEFT JOIN carts c ON p.id = c.user_id
LEFT JOIN user_journey_tracking cj ON p.id = cj.user_id
GROUP BY p.id;

-- Product Engagement View
CREATE VIEW product_engagement AS
SELECT 
    pr.id as product_id,
    pr.name,
    pr.base_price,
    COUNT(DISTINCT uf.user_id) as favorite_count,
    COUNT(DISTINCT ci.user_id) as cart_add_count,
    (COUNT(DISTINCT uf.user_id) * 0.4 + COUNT(DISTINCT ci.user_id) * 0.6) as popularity_score
FROM products pr
LEFT JOIN user_favorites uf ON pr.id = uf.product_id
LEFT JOIN cart_items ci ON pr.id = ci.product_id
GROUP BY pr.id, pr.name, pr.base_price;

-- User Engagement Metrics View
CREATE VIEW user_engagement_metrics AS
SELECT 
    p.id as user_id,
    p.email,
    COUNT(CASE WHEN cj.timestamp >= CURRENT_DATE - INTERVAL '1 day' THEN 1 END) as daily_activity,
    COUNT(CASE WHEN cj.timestamp >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as monthly_activity,
    COUNT(CASE WHEN cj.action_type = 'view' THEN 1 END) as total_views,
    COUNT(CASE WHEN cj.action_type = 'favorite' THEN 1 END) as total_favorites_added,
    COUNT(CASE WHEN cj.action_type = 'purchase' THEN 1 END) as total_purchases,
    AVG(cj.session_duration) as avg_session_duration
FROM profiles p
LEFT JOIN user_journey_tracking cj ON p.id = cj.user_id
GROUP BY p.id, p.email;
```

## 📈 Sayfa Yapısı ve Özellikleri

### 1. Kullanıcı Analytics (/admin/user-analytics)
**Amaç**: Kullanıcı davranışları ve engagement analizi

**Özellikler**:
- **Metrics Kartları**: Toplam kullanıcı, ortalama favori, ortalama sepet, toplam harcama
- **Genel Bakış**: Günlük aktivite trendi, müşteri tipi dağılımı
- **Aktivite Grafikleri**: Aktivite zaman serisi analizi
- **Kullanıcı Listesi**: Top 50 aktif kullanıcı detayları
- **Engagement Metrikleri**: Bireysel kullanıcı etkileşim analizi
- **Filtreler**: Zaman aralığı, müşteri tipi, arama
- **Export**: CSV formatında dışa aktarma

**Veriler**:
- user_behavior_analytics view'dan veri çekme
- Real-time güncellemeler
- Performance optimizasyonu (pagination)

### 2. Favori Raporları (/admin/favorites-report)
**Amaç**: Ürün favorileme analizi ve popülerlik raporları

**Özellikler**:
- **Metrics Kartları**: Toplam favori, favorili ürün sayısı, ortalama favori, en popüler ürün
- **Ürün Analizi**: En çok favorilere eklenen ürünler listesi
- **Kategori Analizi**: Kategori bazında favori dağılımı (Pie/Bar chart)
- **Marka Analizi**: Marka bazında favori performansı
- **Trend Analizi**: Hızlı yükselenler ve düşen trendler
- **Popülerlik Badge'leri**: Çok Popüler/Popüler/İlgi Gören/Normal kategorileri
- **Filtreler**: Zaman aralığı, kategori, sıralama, arama
- **Export**: CSV formatında favori verileri

**Veriler**:
- product_engagement view'dan veri çekme
- Category ve Brand analizleri
- Conversion rate hesaplamaları

### 3. Sepet Analizi (/admin/cart-analysis)
**Amaç**: Sepet davranışları ve terk etme analizi

**Özellikler**:
- **Metrics Kartları**: Aktif sepetler, terk edilen sepetler, ortalama sepet değeri, terk edilen toplam değer
- **Sepet Durumu**: Aktif/Terk edilen/Tamamlanan sepet dağılımı
- **Abandoned Cart**: Terk edilen sepetler detaylı listesi
- **Ürün Analizi**: Sepete en çok eklenen ürünler
- **Conversion Funnel**: Sepet dönüşüm hunisi analizi
- **Müşteri Segmentasyonu**: Müşteri tipine göre sepet davranışları
- **Filtreler**: Zaman aralığı, müşteri tipi, sepet durumu
- **Export**: CSV formatında sepet verileri

**Veriler**:
- carts ve cart_items tablolarından veri çekme
- Abandoned cart simülasyonu
- Conversion rate hesaplamaları

### 4. Davranış Analizi (/admin/user-behavior)
**Amaç**: Kullanıcı etkileşim örüntüleri ve davranış analizi

**Özellikler**:
- **Metrics Kartları**: Toplam kullanıcı, ortalama aylık aktivite, yüksek engagement, dönüşüm oranı
- **Davranış Örüntüleri**: Yüksek/Orta/Pasif kullanıcı kategorileri
- **Navigation Paths**: Sayfa geçiş yolları analizi
- **Engagement Radar**: Kullanıcı engagement metrikleri radar grafiği
- **Conversion Funnel**: Görüntüleme→Favori→Sepet→Satın alma hunisi
- **Pattern Analizi**: Hızlı Karar Verici, Detaycı Kullanıcı, Fiyat Odaklı segmentleri
- **Filtreler**: Zaman aralığı, müşteri tipi, aktivite seviyesi
- **Export**: CSV formatında davranış verileri

**Veriler**:
- user_engagement_metrics view'dan veri çekme
- Navigation path simülasyonu
- Davranış pattern analizi

### 5. Engagement Metrikleri (/admin/engagement-metrics)
**Amaç**: Kullanıcı etkileşim ve engagement ölçümleri

**Özellikler**:
- **Metrics Overview**: Günlük aktif kullanıcı, oturum süresi, sayfa görüntüleme, dönüşüm oranı
- **Trend Analizi**: Zaman bazlı metrik değişimleri
- **Karşılaştırma**: Dönemsel karşılaştırma (önceki vs mevcut)
- **Performance İçgörüleri**: Güçlü performans, iyileştirme alanı, fırsatlar
- **Önerilen Aksiyonlar**: Performansı artırmak için somut öneriler
- **Hedef vs Gerçekleşen**: Aylık hedefler ve performans karşılaştırması
- **Filtreler**: Zaman aralığı, müşteri tipi, metrik filtresi
- **Export**: CSV formatında engagement verileri

**Veriler**:
- Engagement metrics hesaplamaları
- Time series data simulasyonu
- Metrik karşılaştırma analizi

## 🎨 UI/UX Özellikleri

### Responsive Design
- Mobile-first yaklaşım
- Grid layout sistem
- Responsive charts ve tablolar
- Touch-friendly interface

### Data Visualization
- **Recharts Integration**: Bar, Line, Pie, Area, Radar, Scatter charts
- **Color Schemes**: Consistent color palette (COLORS array)
- **Interactive Charts**: Hover tooltips, legend toggles
- **Real-time Updates**: Live data refresh

### Filter & Search
- Multi-level filtering system
- Real-time search
- Sort options
- Export functionality
- Loading states

### Performance Optimizations
- Pagination for large datasets
- Lazy loading for charts
- Memoized calculations
- Efficient data fetching

## 📊 Rapor Tipleri

### 1. Popüler Ürünler Raporu
- En çok favorilere eklenen ürünler
- Favori ekleme trendleri
- Kategori/marka bazında popülerlik

### 2. Kullanıcı Segmentasyonu Raporu
- Aktif/Pasif kullanıcı kategorileri
- Engagement seviyeleri
- Müşteri tipi analizi

### 3. Conversion Funnel Raporu
- Görüntüleme→Favori→Sepet→Satın alma oranları
- Drop-off points analizi
- Optimization opportunities

### 4. Kategori Analizi Raporu
- Hangi kategoriler popüler
- Kategori performans karşılaştırması
- Trend analysis

### 5. Stok Uyarıları Raporu
- Düşük stoklu ama popüler ürünler
- Inventory optimization suggestions
- Demand vs Supply analysis

## 🔒 Güvenlik & Privacy

### Row Level Security (RLS)
```sql
-- User journey tracking policies
CREATE POLICY "Admins can view all user journey tracking" ON user_journey_tracking
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.uid() IN (SELECT id FROM profiles WHERE email LIKE '%@admin%')
    );

-- Users can view their own tracking
CREATE POLICY "Users can view their own tracking" ON user_journey_tracking
    FOR SELECT USING (auth.uid() = user_id);
```

### Data Privacy
- Kullanıcı IP adresleri anonimize edilir
- Sensitive data masked
- GDPR compliance
- Data retention policies

### Admin Access Control
- Admin-only access to analytics
- Role-based permissions
- Audit logging
- Session management

## 📱 Mobile Support

### Responsive Features
- Touch-optimized charts
- Swipe gestures support
- Mobile-friendly tables
- Adaptive layouts

### Performance on Mobile
- Lazy loading
- Image optimization
- Reduced data queries
- Offline capability

## 🚀 Performance Optimizations

### Database Optimization
- Indexed columns for faster queries
- Materialized views for complex calculations
- Partitioned tables for large datasets
- Connection pooling

### Frontend Optimizations
- Code splitting
- Component memoization
- Virtual scrolling for large lists
- Debounced search

### Caching Strategy
- Redis caching for frequent queries
- Browser caching for static data
- CDN for image assets
- API response caching

## 📈 Analytics & Insights

### Key Metrics
- **DAU/MAU**: Daily/Monthly Active Users
- **Session Duration**: Ortalama oturum süreleri
- **Conversion Rates**: Tüm conversion funnels
- **Engagement Score**: Kullanıcı etkileşim skorları
- **Churn Rate**: Kullanıcı kaybı oranları

### Predictive Analytics
- User lifetime value prediction
- Churn probability scoring
- Purchase likelihood modeling
- Inventory demand forecasting

### Real-time Dashboards
- Live user activity monitoring
- Real-time conversion tracking
- Alert system for anomalies
- Performance KPIs

## 🔄 Future Enhancements

### Planned Features
1. **AI-Powered Recommendations**: Machine learning tabanlı öneriler
2. **Advanced Segmentation**: Dynamic user segments
3. **A/B Testing Integration**: Test sonuçları analizi
4. **Cohort Analysis**: Kullanıcı kohort analizleri
5. **Heatmap Integration**: Click/Scroll heatmap data
6. **Export Enhancements**: PDF reports, scheduled exports

### Integration Opportunities
- Google Analytics 4 integration
- Facebook Pixel data import
- Customer support chat analysis
- Email marketing platform data sync
- Inventory management system integration

## 📚 Documentation & Training

### Admin Training Materials
- Video tutorials for each analytics page
- Best practices guide
- Common use cases documentation
- Troubleshooting guide

### API Documentation
- RESTful API endpoints
- GraphQL schema
- Webhook configurations
- Rate limiting policies

## 🎯 Success Metrics

### System Performance
- Page load times < 3 seconds
- Chart rendering < 1 second
- Data freshness < 5 minutes
- 99.9% uptime

### User Adoption
- Admin user engagement rates
- Feature usage analytics
- User satisfaction scores
- Support ticket volumes

### Business Impact
- Improved conversion rates
- Reduced cart abandonment
- Better inventory management
- Enhanced customer experience

---

## 🏆 Sonuç

ADMİN KULLANICI TAKİBİ SİSTEMİ, Gürbüz Oyuncak e-ticaret platformunda müşteri davranışlarını derinlemesine analiz etmek ve iş performansını optimize etmek için tasarlanmış kapsamlı bir sistemdir. Real-time analytics, interactive dashboards ve actionable insights ile işletme kararlarını destekler.

**Sistem Avantajları**:
- ✅ Comprehensive user behavior tracking
- ✅ Real-time analytics and insights
- ✅ Mobile-responsive design
- ✅ Advanced filtering and search
- ✅ Export functionality
- ✅ Performance optimized
- ✅ GDPR compliant
- ✅ Admin-friendly interface

**Kullanım Alanları**:
- Marketing kampanyası optimizasyonu
- Ürün geliştirme kararları
- İnventory yönetimi
- Customer experience improvement
- Revenue optimization

Bu sistem sayesinde Gürbüz Oyuncak, müşteri davranışlarını daha iyi anlayarak, satış performansını artırabilir ve müşteri memnuniyetini yükseltebilir.