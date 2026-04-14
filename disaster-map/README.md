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

## 有楽自治会の境界を描く (管理者作業)

初期状態の `data/yuraku-boundary.geojson` は **仮の矩形**です。実際の自治会範囲に差し替えてください。

1. PC のブラウザで `https://.../disaster-map/admin.html` を開く
2. 左上のツールバーから**多角形**アイコンを選ぶ
3. 地図を順にクリックして境界の頂点を置き、最後にダブルクリックで確定
4. ツールバーの **「GeoJSON をダウンロード」** をクリック
5. ダウンロードした `yuraku-boundary.geojson` で `data/yuraku-boundary.geojson` を**上書き**
6. `sw.js` の `APP_CACHE = 'yuraku-app-v1'` を `v2` に上げる (キャッシュ更新のため)
7. Git で commit → push

既存の境界を編集する場合は「既存の境界を読み込む」ボタンから読み込めます。

## 避難所データを差し替える

初期の `data/shelters.geojson` は**ダミー 4 件**です。本番では川崎市のオープンデータから取得してください。

- 川崎市オープンデータカタログ (避難所・指定緊急避難場所)
- フォーマットは以下の GeoJSON スキーマに合わせてください:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [経度, 緯度] },
      "properties": {
        "name": "○○小学校",
        "name_kana": "○○ショウガッコウ",
        "address": "川崎市麻生区...",
        "type": "指定避難所",
        "capacity": 500,
        "hazards": ["地震", "洪水"],
        "note": ""
      }
    }
  ]
}
```

差し替えたら `sw.js` の `APP_CACHE` バージョンを上げて commit・push してください。

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
