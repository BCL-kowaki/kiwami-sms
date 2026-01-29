import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'report_auth';
const AUTH_COOKIE_VALUE = '1';

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isAuthenticated = authCookie?.value === AUTH_COOKIE_VALUE;

  return NextResponse.json({ authenticated: isAuthenticated });
}
