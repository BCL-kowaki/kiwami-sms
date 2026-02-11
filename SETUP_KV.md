# Vercel KV セットアップ手順

## 問題: tokenの保存に失敗する

このエラーは、Vercel KV の環境変数が設定されていないことが原因です。

## 解決方法

### 方法1: Vercel KV をセットアップする（推奨）

1. **Vercel Dashboard にアクセス**
   - https://vercel.com/dashboard にログイン

2. **Storage を作成**
   - プロジェクトの Settings → Storage → Create Database
   - **Marketplace Database Providers** セクションの **Upstash** をクリック（展開されます）
   - **Upstash for Redis** の「Create」ボタンをクリック

3. **Upstash Redis Database を作成**
   - Upstash の設定画面が開きます
   - データベース名を入力（例: `diagnostic-sms-kv`）
   - リージョンを選択（日本に近いリージョン推奨: `ap-northeast-1` など）
   - 「Create」をクリック

4. **環境変数を取得**
   - 作成後の画面で「秘密を表示」ボタンをクリック
   - 以下の環境変数の値をコピー：
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
   - 「スニペットをコピー」ボタンで一括コピーも可能

5. **`.env.local` に追加**
   ```bash
   # Vercel KV（Upstash Redis）
   KV_REST_API_URL=コピーしたKV_REST_API_URLの値
   KV_REST_API_TOKEN=コピーしたKV_REST_API_TOKENの値
   ```

6. **開発サーバーを再起動**
   ```bash
   npm run dev
   ```

### 方法2: 開発環境で一時的にモックを使う（テスト用）

開発中にVercel KVを使わずにテストしたい場合は、一時的にメモリ内に保存する方法もあります。

ただし、本番環境では必ずVercel KVを使用してください。

## 確認方法

`.env.local` に以下が設定されているか確認：

```bash
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

設定後、開発サーバーを再起動して `/admin` で token を発行してみてください。
