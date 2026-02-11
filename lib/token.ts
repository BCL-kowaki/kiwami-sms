import { randomBytes } from 'crypto';

/**
 * ランダムなtokenを生成（32文字）
 */
export function generateToken(): string {
  return randomBytes(16).toString('hex');
}
