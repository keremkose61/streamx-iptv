# StreamX IPTV - Samsung Smart TV (Tizen) Client

StreamX Samsung Smart TV uygulaması, Tizen Web Application standartlarına uygun olarak tasarlanmış, 10-foot (3 metre oturma mesafesi) kullanıcı arayüzü ve donanım hızlandırmalı video akışı sunan yerel TV istemcisidir.

## Desteklenen Platformlar
- **Tizen TV 4.0+** (2018 ve üzeri tüm Samsung Smart TV modelleri)
- **Tizen TV 7.0 / 8.0** (2023 - 2026 güncel modeller)
- **Çözünürlük:** 1080p Full HD (1920x1080) ve 4K UHD (3840x2160) otomatik ölçekleme

## Mimari ve Özellikler
1. **Uzaktan Kumanda Entegrasyonu (`tizen-adapter.js`):**
   - Samsung Smart Control ve klasik sayı tuşlu kumandalar için `tizen.tvinputdevice.registerKey()` kaydı.
   - Desteklenen tuşlar: `MediaPlay`, `MediaPause`, `MediaPlayPause`, `MediaFastForward`, `MediaRewind`, `MediaStop`, `ChannelUp`, `ChannelDown`, `0-9` sayı tuşları ve Renkli tuşlar (`ColorF0Red`, `ColorF1Green`, `ColorF2Yellow`, `ColorF3Blue`).
   - `KEY_RETURN (10009)` tuşu ile katmanlı geri gitme ve ana ekranda uygulama kapatma onayı (`tizen.application.getCurrentApplication().exit()`).
2. **Ekran Koruyucu Yönetimi:**
   - Canlı yayın oynatılırken `webapis.appcommon.setScreenSaver(SCREEN_SAVER_OFF)` çağrılarak TV ekran koruyucusunun yayını kesmesi engellenir.
3. **10-Foot Mekansal Navigasyon (`spatial-navigation.js`):**
   - D-Pad (Yukarı, Aşağı, Sol, Sağ, OK) yön tuşlarıyla kesintisiz kart ve kategori geçişi.
   - Odaklanan ögelerde yüksek kontrastlı neon halka (`ring-4 ring-indigo-500 scale-105`) ve otomatik kaydırma (`scrollIntoView`).
4. **Çift Motorlu Akış Desteği:**
   - HLS.js ve Tizen yerel HTML5 `<video>` / AVPlay altyapısı.
   - Hata anında otomatik yeniden bağlanma ve akış tamponu denetimi.

## Geliştirme ve Paketleme

### Gereksinimler
1. **Node.js 20+**
2. **Tizen Studio & Tizen CLI** (`tizen` ve `sdb` komutları PATH üzerinde olmalıdır)
3. Samsung Developer hesabı ve Güvenlik Sertifikası (Tizen Certificate Manager)

### Derleme ve Doğrulama
```bash
# Bağımlılıkları ve varlıkları doğrula
npm run build --workspace=@streamx/samsung-tv
```

### Tizen `.wgt` Paketi Üretimi
```bash
# 1. Sertifika profilini tanımlayın (veya varsayılan geliştirici profilini kullanın)
tizen security-profiles add -n DefaultSecurityProfile -a <author.p12> -p <password>

# 2. WGT paketini oluşturun
tizen package -t wgt -s DefaultSecurityProfile -- ./apps/samsung-tv/www
```
Oluşturulan paket: `StreamX001.wgt`

### Gerçek Samsung TV veya Emülatöre Kurulum
```bash
# TV IP adresine bağlanın (TV'de Geliştirici Modu açık olmalıdır)
sdb connect <TV_IP_ADRESI>

# Hedef cihaza paketi yükleyin
tizen install -n StreamX001.wgt -t <HEDEF_CIHAZ_ADI>

# Uygulamayı başlatın
tizen run -p StreamX001.StreamX -t <HEDEF_CIHAZ_ADI>
```
