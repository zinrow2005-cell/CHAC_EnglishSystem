CHAC H～J 補充教材產生器 V3

1. 開啟「校對錄音.html」，逐段預聽老師原音。
2. 名稱格式：雙字共同教學請輸入兩個單字（例如 word1, word2）；獨立段只填一字。這裡的 word1 和 word2 僅為格式示例，並非老師實際教的字。
3. 核實英文/中文內容及起訖後，狀態選「已核對內容與前後邊界」，匯出 CHAC_HJ_segments_review.json。
4. 將 JSON 放在本資料夾根目錄，安裝 Python 3 和 FFmpeg 後執行：
   python tools/build_addon.py CHAC_HJ_segments_review.json
5. 輸出 addons/PB1_HJ/manifest.json、manifest.js、quality_report.json 和 audio/clips/ 片段。
6. 必須逐字補上短句/中文、繪製與確認 images/*.webp 後才能發布；產生器不會自動宣稱教材已完成。
7. 本補充包未直接修改既有 V61 PWA：在未取得主系統原檔前，不可聲稱新字母已出現在正式系統。

注意：目前音訊僅有原始 H-J 課堂錄音，未完成逐字轉錄。錄音與校對資料請以人工確認為準。
