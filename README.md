# CHAC 英文系統 V62 — GitHub 修復整合包

## 檔案包
1. CHAC_V62_01_MAIN_PWA.zip：完整主系統（含 38 張 A～G 學習圖、五種遊戲、PWA）
2. CHAC_V62_02_HJ_AUDIO.zip：新增 H～J 原音，請解壓並將 `audio/HJ.m4a` 放到同一儲存庫 `audio/` 資料夾。

**注意：此次只收到 V61 第一包，因此原有第二包的音檔與遊戲圖片不在本次檔案中。** 若 GitHub 已有 V61 的第二包資源，務必保留；若沒有，需要補上 V61_02_MEDIA。缺少它們，A～G 老師原音或遊戲圖片無法正常使用。

## 這次可確認的改動
- 版本改 V62.0，更新所有靜態腳本快取查詢版本。
- 老師原音播放清單新增 `H–J（待校對）`，對應 `audio/HJ.m4a`。
- 清楚標記 H～J 尚未完成逐字核對，不會在字母選單或遊戲中顯示虛構的單字。
- Service Worker 快取識別改為 v62，降低舊 PWA 快取干擾。

## GitHub 操作
1. 主系統第一包解壓縮，上傳**檔案與資料夾內容**到儲存庫根目錄，不要只上傳 ZIP。
2. Commit 後，將第二包解壓得到的 `audio/HJ.m4a` 上傳至 GitHub `audio/` 路徑，再 Commit。
3. 保留原先的 `audio/AB.m4a`、`audio/CD.m4a`、`audio/E.m4a`、`audio/FG.m4a`、`audio/clips/`、`audio/segments/` 與 `assets/game-pictures/`。
4. 檢查 `https://<帳號>.github.io/<儲存庫>/index.html` 版本 V62.0，於老師原音分頁選 H–J。
5. 若主畫面仍是舊版，關閉 PWA 後改用瀏覽器開啟網址加 `?check=v62`，必要時清除該網站快取再重開。

## 待完成
- H～J 逐字核對與蠟筆字卡、五種遊戲整合（目前只接入完整錄音）。
- iPad 實機互動測試。
