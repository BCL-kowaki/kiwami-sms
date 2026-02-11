import { NextRequest, NextResponse } from 'next/server';
import { verifyCode } from '@/lib/twilio';
import { normalizePhoneNumber, isValidPhoneNumber } from '@/lib/utils';
import { getReportData, updateReportVerified, isTokenValid } from '@/lib/kv';
import { notifyAdminOfVerification } from '@/lib/mail';

const AUTH_COOKIE_NAME = 'report_auth';
const AUTH_COOKIE_VALUE = '1';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24時間

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await request.json();
    const { phone, code, email } = body;

    // tokenの有効性チェック
    const validation = await isTokenValid(token);
    if (!validation.valid) {
      if (validation.expired) {
        return NextResponse.json(
          { ok: false, message: 'このURLは期限切れです', expired: true },
          { status: 410 }
        );
      }
      return NextResponse.json(
        { ok: false, message: '無効なtokenです' },
        { status: 404 }
      );
    }

    // レポートデータの存在確認
    const reportData = await getReportData(token);
    if (!reportData) {
      return NextResponse.json(
        { ok: false, message: 'レポートが見つかりません' },
        { status: 404 }
      );
    }

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { ok: false, message: '電話番号が必要です' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json(
        { ok: false, message: '6桁の認証コードを入力してください' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    if (!isValidPhoneNumber(normalizedPhone)) {
      return NextResponse.json(
        { ok: false, message: '有効な電話番号を入力してください' },
        { status: 400 }
      );
    }

    const isValid = await verifyCode(normalizedPhone, code);

    if (!isValid) {
      return NextResponse.json(
        { ok: false, message: '認証コードが正しくありません' },
        { status: 401 }
      );
    }

    // 認証成功：verifiedフラグを更新
    await updateReportVerified(token, true);

    // 管理者にメール通知（非同期で実行、エラーがあっても認証は成功とする）
    notifyAdminOfVerification({
      phone: normalizedPhone,
      email: email || undefined,
      token,
    }).catch((err) => {
      console.error('通知メール送信エラー:', err);
    });

    // cookie を設定
    const response = NextResponse.json({ ok: true });
    
    response.cookies.set(`${AUTH_COOKIE_NAME}_${token}`, AUTH_COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error('認証エラー:', error);
    return NextResponse.json(
      { ok: false, message: '認証処理に失敗しました' },
      { status: 500 }
    );
  }
}
