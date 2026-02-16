import { createClient } from '@supabase/supabase-js';

// 環境変数がなかったらエラーを出す（ミス防止）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SupabaseのURLとKeyが .env.local に設定されていません！');
}

// クライアントを作成してエクスポート
export const supabase = createClient(supabaseUrl, supabaseKey);