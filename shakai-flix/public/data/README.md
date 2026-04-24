# データディレクトリ

このディレクトリのファイルは **ユーザーが手動で管理** します。

## videos.json

中学社会の動画メタデータ一覧。スキーマは `src/lib/types.ts` の `VideoMeta` を参照。

現状のサンプル5件は、実在する NHK for School の番組名・回数・単元を参考にした **プレースホルダ** です。

- `sourceUrl` は番組のシリーズトップページを指しているだけなので、各話の実URLに差し替えてください。
- `embedUrl` は iframe 埋め込みが可能な場合のみ設定してください（Phase 1 で検証予定）。
- `thumbnailUrl` は `/thumbnails/placeholder-*.svg` を仮に設定しています。NHK公式のサムネURLが直リンク可能か、またはローカル画像に差し替えてください。
- `durationSec` は 10min 番組は 600 秒で揃えていますが、実際の尺に合わせてください。

## quizzes/{videoId}.json

動画ごとのクイズ（4択×10問）。スキーマは `src/lib/types.ts` の `Quiz` を参照。

合格判定は 8問以上正解。`timestampSec` を設定しておくと、不正解時に動画の該当位置へジャンプできます。

## 追加/差替の手順

1. `videos.json` にエントリを追加・編集
2. 新しい動画IDで `quizzes/{id}.json` を作成（必要な場合）
3. `pnpm typecheck` でスキーマ違反がないか確認
4. `pnpm dev` で表示確認
