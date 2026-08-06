# 高端創作者完整文案設計

## 目標

讓三語首頁的 description、結構化資料與第三個價值支柱延續既有高端標題定位：以創作者聲音進入粉絲日常、建立長期連結為主，並以專業營運與持續分潤支撐商業價值。避免「錄一次就能長期賺」「睡覺也賺錢」等低投入、高回報語氣。

## 修改範圍

每個語系首頁只修改以下表面：

- `<meta name="description">`
- `og:description`
- `twitter:description`
- `SoftwareApplication.description` JSON-LD
- Why Vwake 第三支柱的 label、title、quote、description

保留既有 title metadata、其他三個支柱、版面、樣式、數據、功能敘述、法律頁面與關鍵字。

## 繁體中文

- Meta：`Vwake 是為 VTuber 打造的語音鬧鐘平台，讓你的聲音融入粉絲每天的起點，透過無縫購買與鬧鐘體驗，延伸作品價值與長期連結。`
- Social：`讓你的聲音成為粉絲每天醒來的第一刻。Vwake 將 VTuber 語音作品與鬧鐘體驗整合，延伸創作價值與粉絲連結。`
- JSON-LD：使用 Meta 文案。
- Label：`— 03 / 長期價值 / LASTING VALUE —`
- Title：`讓每一段聲音，持續陪伴粉絲。`
- Quote：`作品不只被收藏，更成為粉絲每天回到你的理由。`
- Description：`Vwake 負責上架、銷售、金流與客服，讓你專注創作。每一組語音都能在粉絲的日常中持續被使用，並透過穩定分潤累積長期價值；早安信則讓你在想互動時，延伸更深的陪伴。`

## English

- Meta: `Vwake is a VTuber voice alarm platform that makes your voice part of your fans' daily ritual, pairing a seamless alarm experience with lasting creative value.`
- Social: `Become the first voice your fans hear each day. Vwake brings VTuber voice releases into a seamless alarm experience built for lasting connection.`
- JSON-LD: use the Meta copy.
- Label: `— 03 / LASTING VALUE —`
- Title: `Let every voice stay part of their day.`
- Quote: `Your work is more than collected—it becomes a ritual fans return to every morning.`
- Description: `Vwake handles listing, sales, payments, and customer support so you can stay focused on creating. Each voice release can keep serving fans in daily life while building long-term value through ongoing revenue share; Morning Letters add a deeper layer of connection whenever you choose.`

## 日本語

- Meta：`Vwakeは、VTuberの声をファンの毎日の始まりに届ける音声目覚ましプラットフォーム。シームレスなアラーム体験を通じて、作品の価値とファンとの長期的なつながりを育てます。`
- Social：`あなたの声を、ファンが毎朝最初に聴く声へ。VwakeはVTuberの音声作品と目覚まし体験を一つにし、創作の価値と継続的なつながりを広げます。`
- JSON-LD：Meta 文案を使用。
- Label：`— 03 / LASTING VALUE —`
- Title：`一つひとつの声を、ファンの日常へ。`
- Quote：`作品はコレクションで終わらず、ファンが毎朝あなたに会う習慣になります。`
- Description：`出品・販売・決済・カスタマーサポートはVwakeが担い、あなたは創作に集中できます。音声作品はファンの日常で使われ続け、継続的な収益シェアとともに長期的な価値を育てます。モーニングレターは、届けたいときにより深い交流を加えられます。`

## 驗收與測試

- 三語頁面的四種 description 表面使用規格中的精確文案。
- 第三支柱的四個欄位使用規格中的精確文案。
- metadata 與第三支柱不再包含 `一次錄音`、`被動收入`、`Record once`、`Passive Revenue`、`一度収録して`、`長く稼ぐ`。
- 現有標題、數據與版面測試維持通過。
- 推送後確認 production 部署到預期 commit，並檢查三語頁面、OG metadata、`robots.txt` 與 `sitemap.xml`。
