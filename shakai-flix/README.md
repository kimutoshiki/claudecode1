# Shakai Flix — NHK for School 中学社会 学習アプリ

中学社会（地理 / 歴史 / 公民）の NHK for School 動画を **Netflix 風の UI** で視聴しながら、**視聴履歴・ノート・理解度クイズ・連続学習日数** までひとまとめに記録できる PWA Web アプリです。

> 動画本体は NHK for School 公式ページで視聴します（著作権方針上、埋め込み不可の動画が多いため）。本アプリは **ランチャー + 学習管理レイヤ** として動作します。

## できること

- 🎬 ホーム: ヒーローカルーセル + カテゴリ別横スクロール行
- 📺 視聴ページ: シアター / スタディ / フルスクリーン の 3 レイアウト切替
- 📝 ノート: Tiptap リッチエディタ + タイムスタンプ挿入 + Markdown エクスポート
- ✅ クイズ: 4択×10問、8問以上で合格・✅バッジ獲得
- 📊 マイページ: 連続学習日数、ヒートマップ、苦手タグ、視聴時間グラフ
- ⚙️ 設定: フォントサイズ、既定レイアウト、1日の目標学習時間
- 📱 PWA: アプリシェル + メタデータ・ノート・クイズがオフラインでも使える

## セットアップ（中学生本人でも OK！）

### 必要なもの

- Node.js 20 以上
- pnpm 10 以上 (`npm i -g pnpm` でインストール)

### 起動

```bash
cd shakai-flix
pnpm install
pnpm dev
```

ブラウザで http://localhost:3000 を開くと使えます。

## 動画データの追加

1. `public/data/videos.json` に動画メタデータを追加（サムネURL・NHK公式URL・時間など）
2. 必要なら `public/data/quizzes/{videoId}.json` に 10 問のクイズを追加
3. ページをリロード → ホームに表示されます

`videos.json` のスキーマは `src/lib/types.ts` の `VideoMeta` 型を見てください。

## ショートカット

- `1` / `2` / `3` — レイアウト切替
- `?` — ショートカット一覧を開閉
- `Ctrl + K` — ノートにタイムスタンプを挿入
- `Ctrl + S` — ノートを今すぐ保存

## スクリプト

| コマンド | 用途 |
| --- | --- |
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | 本番ビルド |
| `pnpm start` | ビルド後の本番起動 |
| `pnpm typecheck` | TypeScript 型チェック |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest 実行 |
| `pnpm format` | Prettier 整形 |

## 技術スタック

Next.js 16 (App Router) / TypeScript strict / Tailwind v4 / Zustand / TanStack (Dexie-React) / Tiptap / Fuse.js / Recharts / react-calendar-heatmap / @serwist/next / Vitest

## 著作権について

- 動画本体の配信・ダウンロード・再配信は行いません。すべて NHK for School 公式ページへのリンクで視聴します。
- サムネイルは `videos.json` で指定した URL（または同梱プレースホルダー SVG）を表示します。

## ライセンス

個人学習・教育機関での利用を想定しています。
