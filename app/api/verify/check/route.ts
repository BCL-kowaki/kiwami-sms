import { NextRequest, NextResponse } from 'next/server';
import { verifyCode } from '@/lib/twilio';
import { normalizePhoneNumber, isValidPhoneNumber } from '@/lib/utils';

const AUTH_COOKIE_NAME = 'report_auth';
const AUTH_COOKIE_VALUE = '1';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24時間（秒）

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

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

    // 認証成功：cookie を設定
    const response = NextResponse.json({ ok: true });
    
    response.cookies.set(AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE, {
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
