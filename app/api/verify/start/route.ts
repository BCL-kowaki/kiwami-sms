import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationCode } from '@/lib/twilio';
import { normalizePhoneNumber, isValidPhoneNumber } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { ok: false, message: '電話番号が必要です' },
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

    await sendVerificationCode(normalizedPhone);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('SMS送信エラー:', error);
    
    // Twilio のエラーメッセージを取得
    let errorMessage = 'SMS送信に失敗しました';
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.code) {
      // Twilio エラーコードに基づくメッセージ
      switch (error.code) {
        case 20003:
          errorMessage = 'Twilio認証情報が正しくありません';
          break;
        case 60200:
          errorMessage = '無効な電話番号です';
          break;
        case 60203:
          errorMessage = '最大試行回数を超えました。しばらくしてから再度お試しください';
          break;
        case 60212:
          errorMessage = '電話番号が多すぎます。しばらくしてから再度お試しください';
          break;
        default:
          errorMessage = `SMS送信に失敗しました（エラーコード: ${error.code}）`;
      }
    }
    
    return NextResponse.json(
      { ok: false, message: errorMessage },
      { status: 500 }
    );
  }
}
