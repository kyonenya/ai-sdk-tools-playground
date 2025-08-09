# リポジトリガイドライン

## プロジェクト構造とモジュール構成
- app: Next.js App Router のソースコード（page, layout, api）
  - app/api/chat/route.ts: AI SDK、MCP、およびツールを使用したストリーミングチャットのエンドポイント
- public: 静的アセット
- config: `next.config.ts`, `open-next.config.ts`, `wrangler.jsonc`, `tsconfig.json`, `eslint.config.mjs`, `biome.json`
- env: `.env.local`（開発用）, `.dev.vars`（Wrangler開発用）, `.env.sample`（テンプレート）

## ビルド、テスト、開発コマンド
- `pnpm dev`: Turbopack を使用して `next dev` を実行します
- `pnpm build`: プロダクション用バンドルをビルドします
- `pnpm start`: プロダクションビルドをサーバーで実行します
- `pnpm lint`: ESLint を実行（Next の core-web-vitals ルール）
- `pnpm format`: Biome を使用してコードをフォーマット（2 スペース、ダブルクォート）
- `pnpm tsc`: TypeScriptの型チェック（ウォッチモード）
- `pnpm deploy`: OpenNext → Cloudflare Workers経由でビルドとデプロイを実行します
- `pnpm preview`: Cloudflareプレビューをビルドして起動します
- `pnpm cf-typegen`: `cloudflare-env.d.ts`にCloudflareバインディングタイプを生成します

## コーディングスタイルと命名規則
- TypeScript は strict モード；2スペースのインデント、80文字の行幅、ダブルクォート（Biome）
- React コンポーネント：pascalCase；変数/関数：camelCase
- アプリルーティングファイルとAPIルート：小文字のフォルダー；APIは`app/api/<name>/route.ts`に配置

## テストガイドライン
- ユニットテストフレームワークは未設定です。当面は：
  - ローカルでスモークテスト：`pnpm build && pnpm start` を実行し、`app/api/chat` を実行
  - テストを追加
