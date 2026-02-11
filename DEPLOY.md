# 本番環境へのデプロイ手順

## Vercel へのデプロイ

### 1. プロジェクトをGitHubにプッシュ（推奨）

```bash
# Gitリポジトリを初期化（まだの場合）
git init

# ファイルを追加
git add .

# コミット
git commit -m "Initial commit"

# GitHubにリポジトリを作成してプッシュ
# GitHubでリポジトリを作成後：
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

### 2. Vercel にプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. 「Add New...」→ 「Project」をクリック
3. GitHubリポジトリを選択（または「Import Git Repository」でインポート）
4. プロジェクト設定：
   - **Framework Preset**: Next.js（自動検出されるはず）
   - **Root Directory**: `./`（デフォルト）
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）

### 3. 環境変数を設定

Vercel のプロジェクト設定で、以下の環境変数を追加：

#### 必須の環境変数

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
ADMIN_PASSWORD=your_strong_password_here
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_SES_REGION=ap-northeast-1
```

#### 環境変数の設定方法

1. プロジェクトの **Settings** → **Environment Variables** に移動
2. 各環境変数を追加：
   - **Name**: 環境変数名（例: `TWILIO_ACCOUNT_SID`）
   - **Value**: 値
   - **Environment**: Production, Preview, Development すべてにチェック
3. 「Save」をクリック

**重要**: `ADMIN_PASSWORD` は本番環境用の強力なパスワードに変更してください。

### 4. KV Database の接続確認

既に作成した Upstash Redis データベースが Vercel プロジェクトに接続されているか確認：

1. プロジェクトの **Storage** タブを確認
2. 「診断用SMS KV」が表示されていることを確認
3. 接続されていない場合は、Storage ページから接続

### 5. デプロイ

1. 「Deploy」ボタンをクリック
2. ビルドが完了するまで待機（数分）
3. デプロイ完了後、提供されたURL（例: `https://your-project.vercel.app`）にアクセス

### 6. 動作確認

1. **管理者ページ**: `https://your-project.vercel.app/admin`
   - 設定した `ADMIN_PASSWORD` でログイン
   - token を発行できるか確認

2. **SMS認証**: 発行した token の URL にアクセス
   - SMS認証が正常に動作するか確認

3. **レポート表示**: 認証後にレポートが表示されるか確認

## トラブルシューティング

### ビルドエラー

- **エラー**: `Module not found` や `Cannot find module`
  - **解決**: `package.json` の依存関係を確認し、`npm install` を実行

### 環境変数エラー

- **エラー**: `KV_REST_API_URL が設定されていません`
  - **解決**: Vercel の Environment Variables で正しく設定されているか確認

### SMS送信エラー

- **エラー**: Twilio の認証エラー
  - **解決**: Twilio の環境変数が正しく設定されているか確認
  - Twilio Console でアカウントが有効か確認

## セキュリティチェックリスト

- [ ] `ADMIN_PASSWORD` を強力なパスワードに変更
- [ ] 環境変数が Production 環境にのみ設定されているか確認
- [ ] `.env.local` が Git にコミットされていないか確認（`.gitignore` に含まれているはず）
- [ ] Twilio の認証情報が漏洩していないか確認

## カスタムドメインの設定（任意）

1. プロジェクトの **Settings** → **Domains** に移動
2. ドメインを追加
3. DNS設定を更新（Vercel の指示に従う）

## 継続的デプロイ

GitHub にプッシュすると、自動的にデプロイされます：

- `main` ブランチへのプッシュ → Production 環境にデプロイ
- その他のブランチへのプッシュ → Preview 環境にデプロイ
