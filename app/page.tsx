'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { normalizePhoneNumber } from '@/lib/utils';

const FIXED_REPORT_TEXT = `レポート閲覧ページ

このレポートは SMS 認証後にのみ表示されます。

【レポート内容】
- 診断結果: 正常
- 検査日時: 2024年1月1日
- ステータス: 完了

詳細情報は認証後に表示されます。`;

type AuthState = 'phone' | 'code' | 'authenticated';

// SVG アイコンコンポーネント
const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ErrorIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function HomePage() {
  const [authState, setAuthState] = useState<AuthState>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ページ読み込み時に認証状態を確認
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/verify/status');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setAuthState('authenticated');
        }
      }
    } catch (error) {
      // エラーは無視（認証未完了として扱う）
    }
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedPhone = normalizePhoneNumber(phone);
      const response = await fetch('/api/verify/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: normalizedPhone }),
      });

      const data = await response.json();

      if (data.ok) {
        setAuthState('code');
        setPhone(normalizedPhone);
      } else {
        setError(data.message || 'SMS送信に失敗しました');
      }
    } catch (error) {
      setError('SMS送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/verify/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.ok) {
        setAuthState('authenticated');
      } else {
        setError(data.message || '認証に失敗しました');
      }
    } catch (error) {
      setError('認証処理に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 認証済み：認証完了画面
  if (authState === 'authenticated') {
    return (
      <div className="container">
        <div className="card">
          <div className="icon-wrapper">
            <div className="icon-circle" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <CheckIcon className="" />
            </div>
          </div>
          <h1>認証完了</h1>
          <p className="subtitle">SMS認証が完了しました</p>
          <Link href="/report" style={{ textDecoration: 'none' }}>
            <button style={{ marginTop: '1.5rem' }}>
              <span>レポートを見る</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // コード入力画面
  if (authState === 'code') {
    return (
      <div className="container">
        <div className="card">
          <div className="icon-wrapper">
            <div className="icon-circle">
              <MessageIcon className="" />
            </div>
          </div>
          <h1>認証コード入力</h1>
          <p className="subtitle">
            {phone} に送信された6桁の認証コードを入力してください
          </p>
          <form onSubmit={handleVerifyCode}>
            <div className="form-group">
              <label htmlFor="code">認証コード</label>
              <div className="input-wrapper">
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  disabled={loading}
                  className="code-input"
                />
              </div>
            </div>
            {error && (
              <div className="error">
                <ErrorIcon className="error-icon" />
                <span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading || code.length !== 6}>
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>認証中...</span>
                </>
              ) : (
                <>
                  <ShieldIcon className="" />
                  <span>認証する</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 電話番号入力画面
  return (
    <div className="container">
      <div className="card">
        <div className="icon-wrapper">
          <div className="icon-circle">
            <PhoneIcon className="" />
          </div>
        </div>
        <h1>ご本人確認のため、<br />SMS認証をお願いします</h1>
        <p className="subtitle">
          レポートを閲覧するには、電話番号によるSMS認証が必要です
        </p>
        <form onSubmit={handleSendSMS}>
          <div className="form-group">
            <label htmlFor="phone">電話番号</label>
            <div className="input-wrapper">
              <PhoneIcon className="input-icon" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09012345678"
                required
                disabled={loading}
              />
            </div>
            <div className="input-hint">
              <span>※ 日本の電話番号の場合、090/080/070 などで入力できます</span>
            </div>
          </div>
          {error && (
            <div className="error">
              <ErrorIcon className="error-icon" />
              <span>{error}</span>
            </div>
          )}
          <button type="submit" disabled={loading || !phone.trim()}>
            {loading ? (
              <>
                <div className="spinner" />
                <span>SMS送信中...</span>
              </>
            ) : (
              <>
                <MessageIcon className="" />
                <span>SMSを送信</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
