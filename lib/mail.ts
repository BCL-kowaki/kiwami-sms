// メール通知機能 - Amazon SES
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

interface NotifyAdminParams {
  phone: string;
  email?: string;
  token: string;
}

// 国際形式（+81...）を日本形式（0...）に変換
function formatPhoneForDisplay(phone: string): string {
  if (phone.startsWith('+81')) {
    return '0' + phone.slice(3);
  }
  return phone;
}

// SESクライアントの初期化
const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || 'ap-northeast-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined, // EC2/Lambda等ではIAMロールを使用
});

export async function notifyAdminOfVerification({
  phone,
  email,
  token,
}: NotifyAdminParams): Promise<boolean> {
  const adminEmails = [
    process.env.ADMIN_EMAIL || 'quest@kawaraban.co.jp',
    'y3awtd-hirayama-p@hdbronze.htdb.jp',
  ];
  const fromEmail = process.env.SES_FROM_EMAIL || 'noreply@kawaraban.co.jp';

  // 必要な設定がない場合はスキップ
  if (adminEmails.length === 0) {
    console.log('ADMIN_EMAIL が設定されていないため、通知をスキップします');
    return false;
  }

  if (!fromEmail) {
    console.log('SES_FROM_EMAIL が設定されていないため、通知をスキップします');
    return false;
  }

  const subject = '【SMS認証完了】新しい認証がありました';
  const displayPhone = formatPhoneForDisplay(phone);
  const body = `
SMS認証が完了しました。

■ 認証情報
━━━━━━━━━━━━━━━━━━━━━━
電話番号: ${displayPhone}
メールアドレス: ${email || '未入力'}
Token: ${token}
認証日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
━━━━━━━━━━━━━━━━━━━━━━

このメールは自動送信されています。
`.trim();

  try {
    const command = new SendEmailCommand({
      Source: fromEmail,
      Destination: {
        ToAddresses: adminEmails,
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: body,
          },
        },
      },
    });

    await sesClient.send(command);
    console.log('管理者への通知メールを送信しました');
    return true;
  } catch (error) {
    console.error('SESメール送信エラー:', error);
    return false;
  }
}
