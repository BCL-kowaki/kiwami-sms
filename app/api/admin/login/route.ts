import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_auth';
const ADMIN_COOKIE_VALUE = '1';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24時間

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { ok: false, message: '管理者パスワードが設定されていません' },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { ok: false, message: 'パスワードが正しくありません' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: 'ログイン処理に失敗しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get(ADMIN_COOKIE_NAME);
  const isAuthenticated = authCookie?.value === ADMIN_COOKIE_VALUE;

  return NextResponse.json({ authenticated: isAuthenticated });
}
