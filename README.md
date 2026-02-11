# Diagnostic SMS Authentication

Next.js（App Router）/ TypeScript を使用した SMS 認証によるレポート閲覧システムです。

## 機能

- `/admin` ページで token を発行し、顧客ごとの専用URLを生成
- `/verify/[token]` で token 付き SMS 認証
- `/report/[token]` で認証済みレポートを表示
- Twilio Verify を使用した SMS 認証フロー
- Vercel KV（Upstash）で token とレポートデータを永続化

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
cp .env.local.example .env.local
```

`.env.local` に以下を設定：

```
# Twilio 認証情報
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Vercel KV（Upstash）
KV_REST_API_URL=https://your-kv-endpoint.upstash.io
KV_REST_API_TOKEN=your-kv-token

# 管理者パスワード
ADMIN_PASSWORD=your_admin_password
```

#### Vercel KV の設定方法

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. プロジェクトの Settings → Storage → Create Database
3. KV Database を選択して作成
4. `.env.local` に `KV_REST_API_URL` と `KV_REST_API_TOKEN` を設定

### 3. Twilio の設定

1. [Twilio Console](https://console.twilio.com/) にログイン
2. Account SID と Auth Token を取得
3. Verify Service を作成し、Service SID を取得

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000/report](http://localhost:3000/report) にアクセスしてください。

## 使用方法

### 管理者側（token発行）

1. `/admin` にアクセス
2. 管理者パスワードを入力してログイン
3. 「tokenを発行」ボタンをクリック
4. 発行された認証URLをコピー
5. 顧客にメールで送信

### 顧客側（レポート閲覧）

1. 管理者から送られてきた認証URL（`/verify/[token]`）にアクセス
2. 電話番号を入力（例: `09012345678` または `+819012345678`）
3. 「SMS送信」ボタンをクリック
4. 送信された6桁の認証コードを入力
5. 「認証」ボタンをクリック
6. 認証成功後、`/report/[token]` に自動遷移してレポートが表示されます

## プロジェクト構造

```
.
├── app/
│   ├── admin/
│   │   └── page.tsx                # 管理者ページ（token発行）
│   ├── api/
│   │   ├── admin/
│   │   │   ├── login/route.ts      # 管理者ログインAPI
│   │   │   └── token/route.ts     # token発行API
│   │   ├── report/
│   │   │   └── [token]/route.ts   # レポート取得API
│   │   └── verify/
│   │       ├── start/route.ts      # SMS送信API
│   │       ├── check/route.ts      # 認証コード検証API
│   │       ├── [token]/check/route.ts  # token付き認証API
│   │       └── status/route.ts     # 認証状態確認API
│   ├── report/
│   │   └── [token]/page.tsx       # レポート閲覧ページ（token付き）
│   ├── verify/
│   │   └── [token]/page.tsx       # SMS認証ページ（token付き）
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── kv.ts                       # Vercel KV クライアント
│   ├── token.ts                    # token生成関数
│   ├── twilio.ts                   # Twilio クライアント
│   └── utils.ts                    # ユーティリティ関数
├── .env.local.example
└── package.json
```

## 実装詳細

### API Routes

- `POST /api/verify/start`: SMS認証コードを送信
- `POST /api/verify/check`: 認証コードを検証し、cookie を設定
- `GET /api/verify/status`: 認証状態を確認

### 認証フロー

1. 管理者が `/admin` で token を発行し、顧客に専用URLを送信
2. 顧客が `/verify/[token]` にアクセス
3. 電話番号を入力して `/api/verify/start` で SMS を送信
4. 認証コードを入力して `/api/verify/[token]/check` でコードを検証
5. 認証成功時に KV の `verified` フラグを `true` に更新
6. `/report/[token]` に自動遷移してレポートを表示

### Token とレポートデータ

- Token は 32文字のランダム文字列（crypto.randomBytes）
- レポートデータは Vercel KV に保存（キー: `report:{token}`）
- 有効期限は 7日間（発行時に設定）
- 期限切れや未認証の場合は適切なエラーメッセージを表示

### セキュリティ

- Twilio の認証情報はサーバー側でのみ使用
- HttpOnly cookie で認証状態を管理
- 本番環境では Secure フラグを有効化
