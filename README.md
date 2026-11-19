# StreamX IPTV - Enterprise Multi-Platform IPTV Streaming Ecosystem

StreamX IPTV, kullanıcıların kendilerine ait M3U/M3U8 çalma listelerini ve XMLTV EPG yayın akışlarını güvenli, yüksek performanslı ve modern bir arayüzle izlemelerini ve yönetmelerini sağlayan kurumsal düzeyde çok platformlu bir IPTV ekosistemidir.

> **Yasal Uyarı:** StreamX IPTV hiçbir telifli veya üçüncü taraf yayın içeriği barındırmaz, dağıtmaz veya paket olarak sunmaz. Sistem yalnızca kullanıcı tarafından sağlanan yasal akış adreslerini oynatmak ve organize etmek üzere tasarlanmış istemci ve yönetim platformudur.

---

## Desteklenen Platformlar

| Platform | İstemci Teknolojisi | Oynatıcı Motoru | UI Deneyimi | Paketleme Formatı |
| :--- | :--- | :--- | :--- | :--- |
| **Web İstemcisi** | React 18, Vite, Tailwind CSS | HLS.js / HTML5 Video | Masaüstü & Mobil Web | Web Dağıtımı (`dist/`) |
| **Windows Masaüstü** | Tauri v2 + WebView2 | DirectX Donanım İvmeli | Windows Yerel Masaüstü | NSIS Installer, MSI (`.exe`) |
| **Android Mobil & Tablet** | Kotlin + Jetpack Compose | Google AndroidX Media3 (ExoPlayer) | Dokunmatik Modern Mobil UI | Android APK, AAB |
| **Android TV** | Kotlin + Jetpack Compose | AndroidX Media3 (ExoPlayer) | 10-Foot Leanback D-Pad UI | Android TV APK / AAB |
| **Samsung Smart TV** | Tizen Web Application | HLS.js / Tizen AVPlay | 10-Foot D-Pad Mekansal UI | Tizen Widget (`.wgt`) |
| **LG Smart TV** | webOS Web Application | HLS.js / webOS HTML5 Video | Magic Remote & D-Pad Hibrit | webOS Package (`.ipk`) |

---

## Sistem Mimarisi

```
streamx-iptv/
├── apps/
│   ├── web/               # React 18 + Vite + Tailwind CSS Web Uygulaması
│   ├── desktop/           # Tauri v2 + WebView2 Windows Masaüstü İstemcisi
│   ├── android/           # Kotlin + AndroidX Media3 Mobil ve Android TV İstemcisi
│   ├── samsung-tv/        # Samsung Smart TV (Tizen) 10-Foot İstemcisi
│   └── lg-tv/             # LG Smart TV (webOS) Magic Remote İstemcisi
├── backend/               # Laravel 11 + Sanctum + MySQL 8.4 REST API
├── packages/
│   ├── playlist-engine/   # Akışkan M3U/M3U8 ayrıştırıcı motor
│   ├── player-core/       # Birleşik video oynatıcı adaptör arayüzü (HLS/Native)
│   ├── epg-engine/        # XMLTV ayrıştırıcı ve Now & Next zaman çizelgesi
│   └── api-client/        # TypeScript API istemcisi
├── infrastructure/        # Docker Compose, Nginx, Redis, MySQL üretim yapılandırması
├── docs/                  # Mimari, Güvenlik, Veritabanı ve API dokümantasyonu
└── scripts/               # Platform derleme ve paketleme otomasyon betikleri
```

---

## Güvenlik ve Kurumsal Özellikler

1. **Katı SSRF (Server-Side Request Forgery) Koruması:**
   - Harici çalma listesi ve EPG adresleri indirilirken özel IP aralıkları (RFC 1918), döngüsel adresler (`127.0.0.1`), yerel bağlantılar ve bulut sağlayıcı meta veri adresleri (`169.254.169.254`) `SafeHttpClient` katmanında kesin olarak engellenir.
2. **Çok Kiracılı (Multi-Tenant) Veri İzolasyonu:**
   - Eloquent `BelongsToUser` küresel kapsamı ile kullanıcılar yalnızca kendi çalma listelerini, kanallarını, izleme geçmişlerini ve favorilerini görebilir.
3. **4 Haneli Ebeveyn Kontrolü (Parental PIN):**
   - Yetişkin veya kısıtlı içerik kanalları `verify-pin` uç noktası ve Bcrypt karma algoritması ile korunur.
4. **Freemium & Lisanslama Modeli:**
   - Free (1 Çalma listesi / 1 Cihaz), Premium (5 Çalma listesi / 3 Cihaz) ve Pro (Sınırsız) paket yönetimi.

---

## Hızlı Başlangıç (Geliştirme Ortamı)

### 1. Gereksinimler
- Node.js 20+ ve npm
- PHP 8.3+ ve Composer 2+
- MySQL 8.4+

### 2. Kurulum ve Çalıştırma

```bash
# 1. Depoyu klonlayın
git clone https://github.com/keremkose61/streamx-iptv.git
cd streamx-iptv

# 2. Web bağımlılıklarını kurun
npm install

# 3. Backend kurulumunu yapın
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

---

## Üretim Dağıtımı (Docker)

Sistemi tek komutla tüm servisleriyle (Nginx, PHP 8.3 FPM, MySQL 8.4, Redis 7) ayağa kaldırın:

```bash
cd infrastructure/docker
docker compose up -d --build
```

---

## Test ve Kalite Güvencesi

Tüm testleri çalıştırmak için:

```bash
# Backend Güvenlik ve Birim Testleri (26 Test, 113 Assertion)
cd backend && php artisan test

# Paket Birim Testleri
npm run test --workspaces
```

---

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.
