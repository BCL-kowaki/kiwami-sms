/**
 * 電話番号を E.164 形式に変換
 * 日本の電話番号（090, 080, 070 など）を +81 形式に変換
 */
export function normalizePhoneNumber(phone: string): string {
  // 既に + で始まる場合はそのまま返す
  if (phone.startsWith('+')) {
    return phone;
  }

  // 数字以外を除去
  const digits = phone.replace(/\D/g, '');

  // 日本の電話番号の場合（090, 080, 070, 050 など）
  if (digits.startsWith('0')) {
    // 先頭の 0 を削除して +81 を追加
    return `+81${digits.slice(1)}`;
  }

  // 81 で始まる場合（国際形式だが + がない）
  if (digits.startsWith('81')) {
    return `+${digits}`;
  }

  // その他の場合は + を追加
  return `+${digits}`;
}

/**
 * 電話番号のバリデーション（簡易版）
 */
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  // E.164 形式の簡易チェック（+ で始まり、数字のみ、10桁以上）
  return /^\+[1-9]\d{9,14}$/.test(normalized);
}
