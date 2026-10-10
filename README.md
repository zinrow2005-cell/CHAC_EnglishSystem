# CHAC英文系統 V50.0 — GitHub Pages PWA

## 上傳順序

1. 解壓 `CHAC_V50_01_MAIN_PWA.zip`，將**壓縮包內的檔案與資料夾**上傳至 GitHub 儲存庫根目錄，提交變更。
2. 解壓 `CHAC_V50_02_MEDIA.zip`，同樣上傳至**同一儲存庫的根目錄**，提交變更。不要把 ZIP 本身直接上傳作為網頁。
3. 確認 `index.html`、`manifest.webmanifest`、`sw.js` 均在儲存庫根目錄；`assets/`、`audio/` 與 `addons/` 結構保持不變。
4. Settings → Pages → Deploy from a branch → main / (root)。等待發布完成，在手機瀏覽器打開發布網址。

## 手機安裝

- iPhone / iPad：以 Safari 開啟網址 → 分享 → 加入主畫面。舊版 iPad Safari 可能不支援完整離線功能。
- Android：以 Chrome 開啟網站，使用安裝應用程式／新增至主畫面。
- 主畫面名稱為 **CHAC英文系統**，圖示使用使用者選定的 ABC＋故事書＋背包蠟筆畫。

## PWA 說明

- HTTPS GitHub Pages 可使用 manifest 與 service worker。透過 `file://` 雙擊 HTML 只是預覽，無法測試 PWA 安裝。
- 核心 HTML/CSS/JS 快取以支援基礎離線開啟；圖卡、音訊採**開啟後快取**，首次離線前必須在線上瀏覽相應教材。不能保證尚未打開過的音檔離線可用。
- iOS 系統對離線與儲存空間有自己的限制；此系統不會上傳學生的進度，仍保存在使用裝置的瀏覽器內。
- 後續擴充教材沿用 `addons/` 架構。更改程式後請更新 service worker 的快取版號，避免舊版檔案殘留。

## 文件限制

兩包均少於 100 個檔案，目錄結構可直接合併。GitHub 網頁上傳時可分兩次提交。
