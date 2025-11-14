# Gürbüz Oyuncak E-Ticaret Sistemi

Modern, tam fonksiyonlu B2C/B2B e-ticaret platformu

## Deployed Website
**Production URL:** https://kbblt06io9vf.space.minimax.io

## Teknoloji Stack

### Backend
- **Veritabanı:** Supabase PostgreSQL (15 tablo)
- **Edge Functions:** Deno (XML ürün yükleme)
- **Authentication:** Supabase Auth
- **Security:** Row Level Security (RLS)

### Frontend
- **Framework:** React 18.3 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** TailwindCSS
- **Routing:** React Router v6
- **State:** TanStack React Query
- **Icons:** Lucide React

## Özellikler

### Temel E-Ticaret
- Ana sayfa (Editörün Seçtikleri, Yeni Gelenler, Çok Satanlar)
- 3 seviyeli mega menü
- Ürün detay sayfası
- Kategori filtreleme
- Kullanıcı kayıt/giriş

### B2B Özellikleri
- Çoklu müşteri tipi (B2C, B2B, Toptan, Kurumsal)
- Dinamik fiyatlama sistemi
- Bayi bakiye yönetimi
- Ödül puan sistemi

### Admin Paneli
- Mavi tonlu modern dashboard
- İstatistik kartları
- XML toplu ürün yükleme

## Geliştirme

```bash
cd gurbuz-oyuncak
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```
