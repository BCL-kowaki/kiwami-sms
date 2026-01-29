'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  
  // レポート入力フォーム
  const [reportUrl, setReportUrl] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/login');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.ok) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setError(data.message || 'ログインに失敗しました');
      }
    } catch (error) {
      setError('ログイン処理に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setGeneratedToken(null);
    setVerifyUrl(null);

    try {
      const response = await fetch('/api/admin/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: 'custom',
          reportUrl: reportUrl.trim() || undefined,
          customerEmail: customerEmail.trim() || undefined,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.ok) {
        setGeneratedToken(data.token);
        setVerifyUrl(data.verifyUrl);
        // フォームをリセット
        setReportUrl('');
        setCustomerEmail('');
      } else {
        setError(data.message || 'tokenの発行に失敗しました');
      }
    } catch (error) {
      setError('tokenの発行に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('コピーしました');
  };

  // 認証チェック中
  if (isAuthenticated === null) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">
            <div className="spinner" />
            <span>読み込み中...</span>
          </div>
        </div>
      </div>
    );
  }

  // 未認証：ログイン画面
  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="card">
          <h1>管理者ログイン</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="error">
                <span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading || !password.trim()}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 認証済み：token発行画面
  return (
    <div className="container">
      <div className="card">
        <h1>管理者ページ</h1>
        <p className="subtitle">レポート閲覧用のtokenを発行します</p>

        <form onSubmit={handleGenerateToken}>
          <div className="form-group">
            <label htmlFor="customerEmail">送る顧客のメールアドレス（任意）</label>
            <input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="customer@example.com"
              disabled={loading}
            />
            <div className="input-hint">
              <span>※ 入力すると、認証画面でメールアドレスが自動入力されます</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reportUrl">レポートURL</label>
            <input
              id="reportUrl"
              type="url"
              value={reportUrl}
              onChange={(e) => setReportUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/xxxxx/view"
              disabled={loading}
              required
            />
            <div className="input-hint">
              <span>※ Google DriveやDropboxなどの共有URLを入力してください</span>
            </div>
          </div>

          {error && (
            <div className="error">
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading || !reportUrl.trim()}>
            {loading ? '発行中...' : 'URLを発行'}
          </button>
        </form>

        {error && (
          <div className="error">
            <span>{error}</span>
          </div>
        )}

        {generatedToken && verifyUrl && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#0f0f1a', borderRadius: '8px', border: '1px solid #2a2a3e' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#ffffff' }}>発行されたURL</h2>
            <div style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              <strong style={{ color: '#ffffff' }}>Token:</strong> {generatedToken}
            </div>
            <div style={{ marginBottom: '1rem', wordBreak: 'break-all', color: '#9ca3af' }}>
              <strong style={{ color: '#ffffff' }}>認証URL:</strong>
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#1a1a2e', borderRadius: '4px', border: '1px solid #2a2a3e', color: '#7b5cfa' }}>
                {typeof window !== 'undefined' ? `${window.location.origin}${verifyUrl}` : verifyUrl}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}${verifyUrl}` : verifyUrl)}
              style={{ width: '100%' }}
            >
              URLをコピー
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
