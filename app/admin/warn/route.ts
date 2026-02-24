import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase'; // ※Supabaseのパスが違う場合は微調整してください

// （外側にあったResendの鍵設定は、下のPOST関数の中に移動しました！）

export async function POST(request: Request) {
  try {
    // ★ ここに移動！ エラー対策として空っぽの文字（|| ''）もセットしています
    const resend = new Resend(process.env.RESEND_API_KEY || '');

    // 画面側から「ツールID」「ツール名」「送信先メールアドレス」を受け取る
    const { toolId, toolName, userEmail } = await request.json();

    // ① SupabaseのDBを更新する（statusをwarningに、日付を今日に設定）
    const { error: dbError } = await supabase
      .from('tools')
      .update({
        status: 'warning',
        warning_issued_at: new Date().toISOString(),
      })
      .eq('id', toolId);

    if (dbError) throw dbError;

    // ② Resendを使って警告メールを自動送信する
    const { data, error: emailError } = await resend.emails.send({
      from: 'Searcrate 運営 <onboarding@resend.dev>', // 開発テスト用のアドレス
      to: [userEmail], 
      subject: '【重要】Searcrate 掲載ツールに関する改善のお願い',
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Searcrate 運営チームより</h2>
          <p>掲載中のツール「<strong>${toolName}</strong>」について、利用規約に抵触する恐れのある内容が確認されました。</p>
          <p>本メール受信後、<strong>7日以内</strong>に内容の修正、または削除をお願いいたします。</p>
          <p style="color: red; font-size: 14px;">※期日を過ぎても改善が見られない場合、システムにより自動的に非公開となりますのでご注意ください。</p>
          <hr />
          <p><a href="https://searcrate.com">Searcrate (サークレート)</a></p>
        </div>
      `,
    });

    if (emailError) throw emailError;

    return NextResponse.json({ success: true, message: '警告処理とメール送信が完了しました' });

  } catch (error) {
    console.error('Warning API Error:', error);
    return NextResponse.json({ error: '処理に失敗しました' }, { status: 500 });
  }
}