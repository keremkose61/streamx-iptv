# StreamX IPTV - Windows Native Desktop Client

StreamX masaüstü istemcisi, Tauri v2 ve Windows yerel WebView2 motoru üzerine inşa edilmiştir.

## Neden Tauri v2 (Electron Yerine)?
- **Bellek ve CPU Verimliliği:** Electron tabanlı oynatıcılar boştayken bile 150MB - 300MB RAM tüketirken, Tauri v2 yerel Windows Webview2 kullanarak ortalama ~25MB RAM harcar.
- **Hafif Kurulum:** Kurulum paketi Electron (~120MB) yerine yaklaşık 15MB boyutundadır.
- **Donanım Hızlandırma:** Windows Media Foundation ve DirectX donanım ivmeli video oynatma (HLS/DASH) doğrudan işletim sistemi tarafından optimize edilir.

## Geliştirme ve Yerel Çalıştırma

### Gereksinimler:
1. Node.js 20+
2. Rust (ve Cargo)
3. Visual Studio C++ Build Tools (Windows SDK)

### Adımlar:
```bash
# 1. Web arayüzünü derleyin
npm run build --workspace=@streamx/web

# 2. Masaüstü uygulamasını geliştirme modunda çalıştırın
npm run dev --workspace=@streamx/desktop
```

### Windows Kurulum Paketi (NSIS / MSI) Üretimi:
```bash
# Otomatik üretim betiği
./scripts/build-windows.bat
```
Çıktılar `apps/desktop/src-tauri/target/release/bundle/nsis/` altında oluşturulur.
