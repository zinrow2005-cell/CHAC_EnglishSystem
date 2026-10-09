# Alphabet Adventure V49｜GitHub 雙包上傳版

## 內容
A～G 38 個單字、38 張學習蠟筆圖、38 張遊戲純圖、7 張短句情境圖、4 份老師完整錄音、38 段候選音訊片段。原有專注學習與四種遊戲均保留。

## GitHub 上傳規則
網頁一次選取的檔案數建議小於 100；本專案分兩個壓縮包，每包低於 100 個實際檔案。**GitHub 不會自動解壓 ZIP**，請依下面說明在電腦先解壓、再上傳裡面的檔案與資料夾。

1. 解壓 `V49_01_MAIN.zip`，將內部內容上傳到 GitHub 儲存庫的根目錄（必須包含 `index.html`）。按 Commit changes。
2. 解壓 `V49_02_MEDIA.zip`，將內部內容繼續上傳到**同一儲存庫的根目錄**。按 Commit changes。
3. 若 GitHub 網頁不會保留整個資料夾結構，可以在 GitHub 網頁進入對應 `assets/game-pictures` 或 `audio/clips` 目錄再拖曳檔案。不要把所有圖片放到根目錄。
4. Settings → Pages：Deploy from a branch → `main` → `/ (root)`，儲存後等待部署；GitHub Pages 網址通常是 `https://帳號.github.io/儲存庫名稱/`。
5. 若仍出現舊畫面，重新整理、清除網站快取；本版靜態資源查詢參數已更新為 V49。

## 未來教材新增方式

- 新字母與單字都做成獨立資料包，例如 `addons/h/lesson-h.js`、`assets/words/hat.jpg`、`assets/game-pictures/hat.jpg`。
- 把資料包 JS 路徑寫入 `addons/manifest.js` 的 `PB_ADDON_FILES`，只需覆蓋這個小檔與新增媒體，不須重傳 A～G 全站。
- 格式請參考 `addons/NEW_LESSON_TEMPLATE.txt`。資料包在主系統啟動前載入，導航會自動出現 H 等新字母。
- 舊的 A～G 原音播放器不會自動包含 H；未來新增錄音前，仍需確認時間範圍、分段及對應的教師說明。
- 增加補充包時，請分批上傳，每批少於 100 個檔案。使用同一儲存庫；**不要另外開 GitHub Pages 網站**。

## 注意
原本老師錄音切點仍是候選分段，並非逐字核對最終版。版本重整不會清除同一網址、同一瀏覽器儲存的收藏、星星與學習紀錄；若更改網站網域或儲存庫路徑，瀏覽器儲存資料不會自動搬移。
