import twilio from "twilio";

function mustGetEnv(key: string): string {
  const v = process.env[key];
  if (!v) {
    throw new Error(`${key} が設定されていません`);
  }
  return v;
}

const accountSid = mustGetEnv("TWILIO_ACCOUNT_SID");
const authToken = mustGetEnv("TWILIO_AUTH_TOKEN");
const verifyServiceSid = mustGetEnv("TWILIO_VERIFY_SERVICE_SID");

const client = twilio(accountSid, authToken);

/**
 * SMS認証コードを送信
 */
export async function sendVerificationCode(phone: string): Promise<void> {
  const verification = await client.verify.v2
    .services(verifyServiceSid)
    .verifications.create({
      to: phone,
      channel: "sms",
    });

  if (verification.status === "failed") {
    throw new Error("SMS送信に失敗しました");
  }
}

/**
 * 認証コードを検証
 */
export async function verifyCode(
  phone: string,
  code: string
): Promise<boolean> {
  const verification = await client.verify.v2
    .services(verifyServiceSid)
    .verificationChecks.create({
      to: phone,
      code,
    });

  return verification.status === "approved";
}
