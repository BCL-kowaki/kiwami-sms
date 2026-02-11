'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FIXED_REPORT_TEXT = `レポート閲覧ページ

このレポートは SMS 認証後にのみ表示されます。

【レポート内容】
- 診断結果: 正常
- 検査日時: 2024年1月1日
- ステータス: 完了

詳細情報は認証後に表示されます。`;

export default function ReportPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/verify/status');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        if (!data.authenticated) {
          // 認証されていない場合はルートページにリダイレクト
          router.push('/');
        }
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // 認証チェック中
  if (loading || isAuthenticated === null) {
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

  // 認証済み：レポート表示
  if (isAuthenticated) {
    return (
      <div className="container">
        <div className="card">
          <h1>レポート</h1>
          <div className="report">{FIXED_REPORT_TEXT}</div>
        </div>
      </div>
    );
  }

  // 認証されていない場合（リダイレクト中）
  return null;
}
