# 上線檢查清單

公開網址與檔案可由開發工具檢查；需要登入 Google、Bing、商店或社群帳號的步驟需由帳號擁有者操作或授權。

## 每次重要部署後

- [ ] 確認 production 已部署預期的 Git commit。
- [ ] 確認 `https://vwake.app/robots.txt` 與 `https://vwake.app/sitemap.xml` 回傳 200，且內容正確。
- [ ] 用分享預覽工具檢查中、英、日首頁的標題、描述與 OG 圖。
- [ ] 用 [Rich Results Test](https://search.google.com/test/rich-results) 檢查首頁 JSON-LD；有錯誤才列修正工作。

## 搜尋服務設定（尚未設定時做一次）

- [ ] 在 [Google Search Console](https://search.google.com/search-console) 建立 `vwake.app` 網域資源並完成 DNS 驗證。
- [ ] 在 Search Console 提交 `https://vwake.app/sitemap.xml`。
- [ ] 用 URL Inspection 確認 `/`、`/en/`、`/ja/` 的索引狀態；只有尚未索引或重要更新需要加速時才要求建立索引。
- [ ] 選配：將 Search Console 網站匯入 [Bing Webmaster Tools](https://www.bing.com/webmasters)。

## 品牌導流（不是搜尋排名保證）

- [ ] App Store／Google Play 上架後，在商店頁加入 `https://vwake.app`。
- [ ] 在官方 IG、X、Discord 等主要帳號加入官網連結。
- [ ] 發布重大更新時，依實際受眾選擇平台宣傳，不為了「反向連結」大量鋪文。
