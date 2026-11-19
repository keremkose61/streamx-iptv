# StreamX IPTV - LG Smart TV (webOS) Client

StreamX LG Smart TV uygulaması, LG webOS TV mimarisine özel optimize edilmiş, Magic Remote (işaretçi + çark) ve D-Pad yön tuşlarını hibrit olarak destekleyen 10-foot yerel TV istemcisidir.

## Desteklenen Platformlar
- **LG webOS TV 3.5 - 6.0** (2017 - 2021 modelleri)
- **LG webOS 22 / 23 / 24 / 25+** (Güncel OLED ve QNED modelleri)
- **Çözünürlük:** 1080p Full HD (1920x1080) ve 4K UHD (3840x2160)

## Mimari ve Özellikler
1. **LG Magic Remote & D-Pad Hibrit Desteği (`webos-adapter.js`):**
   - LG Magic Remote işaretçi (pointer) ekrandayken doğal tıklama ve fare tekeri ile kaydırma.
   - İşaretçi kaybolduğunda anında D-Pad (Yukarı, Aşağı, Sol, Sağ, OK) mekansal navigasyonuna geçiş.
   - webOS Geri tuşu (`keyCode === 461`) ile kademeli geri çekilme ve `webOS.platformBack()` çıkış desteği.
   - webOS Medya tuşları: `Play (415)`, `Pause (19)`, `Stop (413)`, `Fast Forward (417)`, `Rewind (412)`.
   - webOS Renkli tuşlar: `Red (403)`, `Green (404)`, `Yellow (405)`, `Blue (406)`.
2. **webOS Yaşam Döngüsü (Lifecycle):**
   - `webOSRelaunch` olay dinleyicisi ile çoklu görev (multitasking) ve arka plandan ön plana geçiş desteği.
   - `visibilitychange` ile uygulama arka plana geçtiğinde video akışını duraklatma ve bellek optimizasyonu.
3. **10-Foot Kullanıcı Arayüzü:**
   - 1920x1080 yerel render, TV overscan payları (%5 güvenli kenar boşluğu).
   - Canlı kanal önizlemesi, EPG yayın akışı, favori kanallar ve direkt kanal numarası tuşlama ("CH 24").

## Geliştirme ve Paketleme

### Gereksinimler
1. **Node.js 20+**
2. **webOS TV CLI (webOS TV SDK)** (`ares-package`, `ares-install`, `ares-launch`, `ares-setup-device` PATH üzerinde olmalıdır)
3. LG Developer hesabı ve webOS TV Developer Mode uygulaması

### Derleme ve Doğrulama
```bash
# Varlıkları doğrula ve dist dizinini hazırla
npm run build --workspace=@streamx/lg-tv
```

### webOS `.ipk` Paketi Üretimi
```bash
# ares-package ile IPK paketini derle
ares-package ./apps/lg-tv/www -o ./apps/lg-tv/dist
```
Oluşturulan paket: `apps/lg-tv/dist/org.streamx.iptv_1.0.0_all.ipk`

### Gerçek LG TV veya webOS TV Emülatörüne Kurulum
```bash
# 1. Cihazınızı CLI'a tanıtın
ares-setup-device

# 2. IPK paketini TV'ye yükleyin
ares-install -d <HEDEF_CIHAZ> ./apps/lg-tv/dist/org.streamx.iptv_1.0.0_all.ipk

# 3. Uygulamayı TV üzerinde başlatın
ares-launch -d <HEDEF_CIHAZ> org.streamx.iptv

# 4. Geliştirici hata ayıklama konsolu (Chrome Web Inspector)
ares-inspect -d <HEDEF_CIHAZ> -a org.streamx.iptv
```
