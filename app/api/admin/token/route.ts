import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/token';
import { saveReportData, type ReportData } from '@/lib/kv';

const ADMIN_COOKIE_NAME = 'admin_auth';
const ADMIN_COOKIE_VALUE = '1';

function checkAdminAuth(request: NextRequest): boolean {
  const authCookie = request.cookies.get(ADMIN_COOKIE_NAME);
  return authCookie?.value === ADMIN_COOKIE_VALUE;
}

export async function POST(request: NextRequest) {
  // 管理者認証チェック
  if (!checkAdminAuth(request)) {
    return NextResponse.json(
      { ok: false, message: '認証が必要です' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { reportType, reportUrl, customerEmail } = body;

    const token = generateToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7日後

    // レポートタイプの検証
    const validReportType = reportType === 'custom' ? 'custom' : 'fixed';
    
    // カスタムレポートの固定文言
    const CUSTOM_REPORT_TITLE = '診断レポート';
    const CUSTOM_REPORT_BODY = 'この度は、診断サービスをご利用いただきありがとうございます。\n\n下記のボタンよりレポートをお受け取りいただけます。';

    const reportData: ReportData = {
      token,
      reportType: validReportType,
      reportTitle: validReportType === 'custom' ? CUSTOM_REPORT_TITLE : undefined,
      reportBody: validReportType === 'custom' ? CUSTOM_REPORT_BODY : undefined,
      reportUrl: reportUrl?.trim() || undefined,
      customerEmail: customerEmail?.trim() || undefined,
      verified: false,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    // 環境変数チェック
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json(
        { 
          ok: false, 
          message: 'Vercel KV の環境変数が設定されていません。KV_REST_API_URL と KV_REST_API_TOKEN を .env.local に設定してください。' 
        },
        { status: 500 }
      );
    }

    const saved = await saveReportData(reportData);

    if (!saved) {
      return NextResponse.json(
        { 
          ok: false, 
          message: 'tokenの保存に失敗しました。Vercel KV の接続を確認してください。' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      token,
      verifyUrl: `/verify/${token}`,
    });
  } catch (error) {
    console.error('token発行エラー:', error);
    return NextResponse.json(
      { ok: false, message: 'tokenの発行に失敗しました' },
      { status: 500 }
    );
  }
}
