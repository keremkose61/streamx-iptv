# StreamX IPTV - Android & Android TV Client

StreamX Android uygulaması, hem Android telefon ve tabletleri hem de Android TV (Leanback 10-foot UI) cihazlarını tek bir birleşik Kotlin & Jetpack Compose projesinde destekler.

## Mimari Özellikler
- **Medya Motoru:** Google'ın en güncel video standardı olan **AndroidX Media3 (ExoPlayer)**.
- **Canlı Akış Desteği:** Düşük gecikmeli HLS (`media3-exoplayer-hls`) ve DASH (`media3-exoplayer-dash`).
- **Özelleştirilmiş Tampon Denetimi (`DefaultLoadControl`):** Canlı IPTV yayınları için optimize edilmiş 15-30 sn tampon aralığı.
- **Android TV Desteği:**
  - `TvMainActivity`: Android TV uzaktan kumandası (D-Pad yön tuşları, OK, Play/Pause) ile tam uyumlu 10-foot kart navigasyonu.
  - `AndroidManifest.xml` üzerinde `android.software.leanback` ve `LEANBACK_LAUNCHER` desteği.

## APK / AAB Derleme Adımları
```bash
# Debug APK üretimi
./gradlew assembleDebug

# Release Android App Bundle (AAB - Play Store & TV) üretimi
./gradlew bundleRelease
```
Çıktılar `app/build/outputs/apk/debug/` ve `app/build/outputs/bundle/release/` dizinlerinde oluşturulur.
