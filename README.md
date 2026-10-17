# Yay Job

家庭内労働を管理するアプリ（PWA）

## GitHub Pages での公開手順

1. このフォルダの中身（`index.html`, `manifest.json`, `sw.js`, `icons/` フォルダ）をすべて GitHub リポジトリにアップロードする
2. リポジトリの **Settings → Pages** を開く
3. **Source** を `main` ブランチ（フォルダはルート `/` または該当フォルダ）に設定して保存
4. 数分待つと `https://ユーザー名.github.io/リポジトリ名/` で公開される

## ファイル構成

```
（すべてリポジトリのルート直下に置く）
├── index.html          メインアプリ
├── manifest.json       PWA 設定（アプリ名・アイコン・色）
├── sw.js               オフライン対応（Service Worker）
├── icon-192.png        Android 用アイコン
├── icon-512.png        高解像度・スプラッシュ用
└── apple-touch-icon.png iPhone 用アイコン
```

**重要：** 6つのファイルはすべてフォルダを作らず、リポジトリのルート直下に置いてください。

## ホーム画面に追加する方法

### iPhone（Safari）
1. 公開された URL を Safari で開く
2. 共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」を選ぶ

### Pixel / Android（Chrome）
1. 公開された URL を Chrome で開く
2. 右上のメニュー（︙）をタップ
3. 「アプリをインストール」または「ホーム画面に追加」を選ぶ

ホーム画面から起動すると、ブラウザのバーが消えてアプリのように全画面で使えます。

## 注意

- データは各端末の中だけに保存されます（端末をまたいだ共有はされません）
- レポートタブから週次レポートを LINE で送ったり、コピーしたりできます

## 開発メモ（v8〜）

### 家事とお手当

- 週は月曜〜日曜。1日に完了できる家事は1つ（同じ `dailyGroup` のもの）
- 家事ごとに週の上限（`maxPerWeek`）がある。上限はノルマではない
- お風呂掃除は土日だけ（`weekdays: [6, 0]`）・週1回まで
- お手当 = 基本額 × できばえの割合（◎100% / ○50% / △25%、設定で変更可）。
  記録した時点の金額を記録側（`amount`）に保存する
- 「見送り」は完了にも未実施にも数えず、上限や1日1つの枠も使わない。
  週間・レポートでは見送りがあった日数で数える
- 記録・見送り・取り消し・できばえの変更ができるのは今日と前日だけ（v9〜）。
  使い始めた日（`startDate`）より前の日は前日でも変えられない。
  `startDate` がなければ `premigration_v7.savedAt` の日付、それもなければ今日になる

### localStorage キー（すべて `yayjob_` で始まる）

```
yayjob_schema        2
yayjob_v2_settings   { version, startDate, qualityRates:{perfect,ok,partial}, tasks:[{id,name,short,abbr,minutes,baseAmount,maxPerWeek,dailyGroup,weekdays,weekdaysLabel,criteria,active}] }
yayjob_v2_logs       { "YYYY-MM-DD": { [taskId]: {status:'done', quality, base, minutes, amount, at} | {status:'skipped', at} } }
yayjob_v2_payments   [{id, type:'received'|'advance', amount, date, note, createdAt}]
yayjob_v2_reports    [{weekKey(月曜), label, text, savedAt}]
yayjob_premigration_v7  v8 の初回起動時に、v7 のキーを丸ごと控えたもの
yayjob_preimport_backup バックアップを読み込む直前の状態の控え
```

v7 までのキー（`yayjob_tasks / logs / payments / name / reports`）は読み書きしない。
v7 のファイルに戻せば、移行前の状態のまま動く。

### 更新するとき

`index.html` / `sw.js` / `manifest.json` を変えたら、`sw.js` の `CACHE_NAME` を1つ上げる。

### 動作確認

```bash
python3 -m http.server
```
