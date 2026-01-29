import { kv } from '@vercel/kv';

// KV環境変数のチェック
if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  console.warn('警告: Vercel KV の環境変数が設定されていません。KV_REST_API_URL と KV_REST_API_TOKEN を設定してください。');
}

export interface ReportData {
  token: string;
  reportType: 'fixed' | 'custom';
  reportTitle?: string;
  reportBody?: string;
  reportUrl?: string;
  verified: boolean;
  createdAt: string;
  expiresAt: string;
}

const KV_PREFIX = 'report:';

/**
 * tokenからレポートデータを取得
 */
export async function getReportData(token: string): Promise<ReportData | null> {
  try {
    const data = await kv.get<ReportData>(`${KV_PREFIX}${token}`);
    return data;
  } catch (error) {
    console.error('KV取得エラー:', error);
    return null;
  }
}

/**
 * レポートデータを保存
 */
export async function saveReportData(data: ReportData): Promise<boolean> {
  try {
    // 環境変数チェック
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.error('KV保存エラー: 環境変数が設定されていません');
      throw new Error('KV_REST_API_URL または KV_REST_API_TOKEN が設定されていません');
    }
    
    await kv.set(`${KV_PREFIX}${data.token}`, data);
    return true;
  } catch (error: any) {
    console.error('KV保存エラー:', error);
    console.error('エラー詳細:', error?.message || error);
    return false;
  }
}

/**
 * レポートデータのverifiedフラグを更新
 */
export async function updateReportVerified(token: string, verified: boolean): Promise<boolean> {
  try {
    const data = await getReportData(token);
    if (!data) {
      return false;
    }
    data.verified = verified;
    await saveReportData(data);
    return true;
  } catch (error) {
    console.error('KV更新エラー:', error);
    return false;
  }
}

/**
 * tokenが有効かチェック（存在確認 + 期限チェック）
 */
export async function isTokenValid(token: string): Promise<{ valid: boolean; expired?: boolean }> {
  const data = await getReportData(token);
  if (!data) {
    return { valid: false };
  }
  
  const now = new Date();
  const expiresAt = new Date(data.expiresAt);
  
  if (now > expiresAt) {
    return { valid: false, expired: true };
  }
  
  return { valid: true };
}
