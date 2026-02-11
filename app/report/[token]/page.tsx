'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { ReportData } from '@/lib/kv';

const FIXED_REPORT_TEXT = `レポート閲覧ページ

このレポートは SMS 認証後にのみ表示されます。

【レポート内容】
- 診断結果: 正常
- 検査日時: 2024年1月1日
- ステータス: 完了

詳細情報は認証後に表示されます。`;

export default function ReportTokenPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReport();
  }, [token]);

  const loadReport = async () => {
    try {
      const response = await fetch(`/api/report/${token}`);
      const data = await response.json();

      if (data.ok) {
        const report: ReportData = data.data;

        // 期限切れチェック
        const now = new Date();
        const expiresAt = new Date(report.expiresAt);
        if (now > expiresAt) {
          setError('このURLは期限切れです');
          setLoading(false);
          return;
        }

        // 認証チェック
        if (!report.verified) {
          setError('先にSMS認証を完了してください');
          setLoading(false);
          return;
        }

        setReportData(report);
      } else {
        if (data.expired) {
          setError('このURLは期限切れです');
        } else {
          setError(data.message || 'レポートが見つかりません');
        }
      }
    } catch (error) {
      setError('レポートの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToVerify = () => {
    router.push(`/verify/${token}`);
  };

  // ローディング中
  if (loading) {
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

  // エラー表示
  if (error || !reportData) {
    return (
      <div className="container">
        <div className="card">
          <h1>エラー</h1>
          <div className="error" style={{ marginBottom: '1rem' }}>
            <span>{error || 'レポートが見つかりません'}</span>
          </div>
          {error.includes('認証') && (
            <button onClick={handleGoToVerify}>
              <span>SMS認証を行う</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // レポート表示
  const displayText = reportData.reportType === 'fixed' 
    ? FIXED_REPORT_TEXT 
    : (reportData.reportBody || 'レポート内容がありません');

  // タイトルを決定（カスタムレポートでタイトルがない場合は「レポート」）
  const reportTitle = reportData.reportTitle || 'レポート';

  return (
    <div className="container">
      <div className="card">
        <h1>{reportTitle}</h1>
        <div className="report" style={{ whiteSpace: 'pre-wrap' }}>{displayText}</div>
        {reportData.reportUrl && (
          <div style={{ marginTop: '2rem' }}>
            <a
              href={reportData.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(90deg, #2db8f9 0%, #7b5cfa 50%, #aa30ff 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              PDFを開く
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
