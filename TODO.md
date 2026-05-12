# TODO

## SEO 上線後手動步驟(我做不了,你要自己操作)

- [ ] **Google Search Console** — https://search.google.com/search-console
  - [ ] 新增資源 `vwake.app`(建議用「網域」類型 + DNS TXT 驗證)
  - [ ] 「Sitemap」→ 提交 `https://vwake.app/sitemap.xml`
  - [ ] 「網址審查」→ `https://vwake.app/` → 要求建立索引
  - [ ] 「網址審查」→ `https://vwake.app/en/` → 要求建立索引

- [ ] **Bing Webmaster Tools** — https://www.bing.com/webmasters
  - [ ] 加入網站、提交 sitemap(可從 GSC 直接 import)

- [ ] **OG 分享圖檢查**
  - [ ] 目前用 `store_preview/storepreview1.png`,確認尺寸(理想 1200×630)
  - [ ] 用 https://www.opengraph.xyz/ 預覽分享效果
  - [ ] 若需要專屬 OG 圖,做一張橫式 banner 放 `assets/og-image.png`

- [ ] **反向連結**(讓 Google 把這站認成「Vwake 官方」)
  - [ ] App Store / Google Play 上架後,商店頁設定官網連結
  - [ ] IG / X / Discord bio 加上 `vwake.app`
  - [ ] 巴哈姆特 / 噗浪 / Threads 等 VTuber 圈常用平台發文

- [ ] **驗證部署**
  - [ ] `curl -I https://vwake.app/robots.txt` 回 200
  - [ ] `curl -I https://vwake.app/sitemap.xml` 回 200
  - [ ] 用 https://search.google.com/test/rich-results 測 JSON-LD 結構化資料
