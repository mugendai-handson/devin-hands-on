# Devin Task Board

タスク管理アプリ

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + React 19 + TypeScript
- **DB**: PostgreSQL 16 + Prisma
- **スタイル**: Tailwind CSS v4
- **インフラ**: Docker Compose

## セットアップ

### 前提条件

- Node.js 22+
- Docker / Docker Compose

### 1. リポジトリのクローン

```bash
git clone https://github.com/micci184/devin-handson.git
cd devin-handson
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

### 3. Docker Compose で起動

```bash
docker compose up -d
```

## ドキュメント

- [機能仕様書](docs/spec.md)
- [ユーザーストーリー](docs/user-stories.md)
- [Issue 計画](docs/issue.md)
- [API 仕様 (OpenAPI 3.1)](docs/openapi.yaml) — 全 REST API のリクエスト/レスポンスを定義。実装はこの仕様に準拠する。

### OpenAPI 仕様のプレビュー

[Swagger Editor](https://editor.swagger.io/) や [Redocly Preview](https://redocly.com/redoc/) に
`docs/openapi.yaml` を貼り付ける、もしくはローカルで以下を実行する。

```bash
# 静的 HTML を生成
npx @redocly/cli build-docs docs/openapi.yaml -o docs/openapi.html

# Lint
npx @redocly/cli lint docs/openapi.yaml
```
