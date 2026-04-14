# 有楽自治会 防災マップ

神奈川県川崎市麻生区「有楽自治会」の範囲に絞った防災マップ Web アプリです。
高齢の住民がスマートフォンで簡単に使え、**一度オンラインで開けばオフラインでも動きます** (PWA)。

## 特長

- Leaflet.js + 国土地理院 淡色地図タイルによる地図表示
- 自治会範囲を強調 (範囲外は暗くマスク表示)
- 指定避難所・緊急避難場所のマーカーとポップアップ
- 超シンプル 3 ボタン UI (現在地 / 近くの避難所 / ハザード表示)
- Service Worker によるオフライン対応
- ホーム画面に追加するとアプリのように起動

## フォルダ構成

```
disaster-map/
├── index.html              # メインページ (住民向け)
├── admin.html              # 境界描画の管理ページ
├── offline.html            # オフライン時フォールバック
├── manifest.webmanifest    # PWA マニフェスト
├── sw.js                   # Service Worker
├── css/app.css             # 高齢者向けスタイル (大きなボタン等)
├── js/                     # アプリロジック
├── vendor/leaflet/         # Leaflet 本体 (ローカル同梱)
├── vendor/leaflet-geoman/  # 管理ページでのみ使用
├── data/
│   ├── yuraku-boundary.geojson   # 自治会境界
│   └── shelters.geojson          # 避難所データ
└── icons/                  # PWA アイコン
```

## ローカルで動かす

Service Worker と fetch() を使うため `file://` では動きません。簡易 HTTP サーバを使ってください。

```bash
cd disaster-map
python3 -m http.server 8000
# http://localhost:8000/ をブラウザで開く
```

オフラインテスト:
1. 一度普通に開いて Service Worker 登録を確認する (DevTools → Application → Service Workers)
2. DevTools の Network パネルで "Offline" にチェックを入れる
3. リロード → 地図・境界・避難所・閲覧済みのタイルが表示されれば成功

## GitHub Pages にデプロイする

1. このリポジトリを GitHub に push する
2. リポジトリの Settings → Pages で Source を `main` / root (または `/docs`) に設定
3. 公開 URL の例: `https://<ユーザー名>.github.io/claudecode1/disaster-map/`
4. スマホでその URL にアクセスし、ブラウザのメニューから「ホーム画面に追加」

## 管理ページで境界と避難所を編集する

PC のブラウザで `https://kimutoshiki.github.io/claudecode1/disaster-map/admin.html` を開くと、
**「境界を描く」**と**「避難所を登録する」**の2つのタブで編集できます。

### 境界を描く
1. 「境界を描く」タブを選択
2. 地図左上のツールバーから**多角形**アイコンをクリック
3. 地図を順にクリックして頂点を置き、最後にダブルクリックで確定
4. 「境界をダウンロード」→ `yuraku-boundary.geojson` が手元に保存される
5. 下記の「ダウンロードしたファイルをGitHubに反映する」手順で差し替え

### 避難所を登録する
1. 「避難所を登録する」タブを選択
2. 「避難所を追加」ボタンを押してから、地図上の避難所の位置をタップ
3. 出てくるフォームに名称・住所・収容人数・対応災害などを入力して「保存」
4. 必要なだけ繰り返す (既存のピンをタップすると再編集できます)
5. 「避難所をダウンロード」→ `shelters.geojson` が手元に保存される
6. 下記の手順でGitHubに反映

### ダウンロードしたファイルをGitHubに反映する (初心者向け)

コマンド操作が不要な方法です。

1. ブラウザで https://github.com/kimutoshiki/claudecode1/tree/main/disaster-map/data を開く
2. 右上の **「Add file」** → **「Upload files」** をクリック
3. ダウンロードした `yuraku-boundary.geojson` または `shelters.geojson` を **ドラッグ＆ドロップ**
   (同名ファイルは自動で上書きされます)
4. 画面下の **「Commit changes」** をクリック (メッセージはそのままでOK)
5. 1〜3分待つと本番サイトに自動反映されます
6. スマホでサイトを開いてリロード (Service Worker のキャッシュを更新するため、
   一度ブラウザを完全終了してから開き直すと確実です)

### 慣れてきたら: 完全キャッシュ更新
アプリ本体のファイルを変更した時は、住民が古いバージョンを使い続けないよう
`disaster-map/sw.js` の `APP_CACHE = 'yuraku-app-v1'` を `v2` に上げてください
(データファイルだけの差し替えなら不要)。

## 技術メモ

- **位置情報**: iOS Safari はユーザー操作が必要なため、ボタンを押したときだけ許可ダイアログが出ます
- **「近くの避難所」**: v1 は直線距離のみ。道路を考慮したルート案内は v2 以降の予定です
- **地図タイル**: 初回オンライン時に閲覧したエリアがキャッシュされます。機内モードでも使えるよう、初めて開いたときに自治会エリアを一通り眺めておくと安心です
- **帰属表示**: 地図右下の「国土地理院」リンクは必須です。CSS で消さないでください

## 将来の拡張 (v2 以降)

- 浸水想定区域・土砂災害警戒区域の表示
- AED・消火器・給水所など自治会独自リソースの登録
- 実道路を使った避難経路ナビ
- アイコンのデザイン刷新

## ライセンス・データ出典

- 地図タイル: 国土地理院 (https://maps.gsi.go.jp/development/ichiran.html)
- Leaflet: BSD-2-Clause
- leaflet-geoman-free: MIT
