import { NextRequest, NextResponse } from 'next/server';
import { getReportData, isTokenValid } from '@/lib/kv';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

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

    const data = await getReportData(token);
    if (!data) {
      return NextResponse.json(
        { ok: false, message: 'レポートが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error('レポート取得エラー:', error);
    return NextResponse.json(
      { ok: false, message: 'レポートの取得に失敗しました' },
      { status: 500 }
    );
  }
}
