import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // ★ エラー対策: 鍵の準備を関数の中にお引越し ＆ フォールバック(|| '')を追加
    const resend = new Resend(process.env.RESEND_API_KEY || '');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { toolId, toolName, authorId, authorName } = await request.json();

    // 1. この作者をフォローしている人のID一覧を取得
    const { data: follows } = await supabaseAdmin
      .from('follows')
      .select('follower_id')
      .eq('following_id', authorId)
      .eq('notify_on', true);

    if (!follows || follows.length === 0) {
      return NextResponse.json({ success: true, message: 'フォロワーがいません' });
    }

    // 2. フォロワーのメールアドレスを取得する
    const followerEmails: string[] = [];
    for (const follow of follows) {
      
      // ★ その人の通知設定をチェック
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('notification_on')
        .eq('id', follow.follower_id)
        .single();

      // notification_on が明確に false（オフ） になっている人はスキップ
      if (profile?.notification_on === false) continue;

      const { data } = await supabaseAdmin.auth.admin.getUserById(follow.follower_id);
      if (data.user?.email) {
        followerEmails.push(data.user.email);
      }
    }

    if (followerEmails.length === 0) {
      return NextResponse.json({ success: true, message: '通知可能なアドレスがありません' });
    }

    // 3. Resendでフォロワー全員にメールを一斉送信 (BCCを使ってプライバシーを保護)
    const { error: emailError } = await resend.emails.send({
      from: 'Searcrate 通知 <onboarding@resend.dev>', // ※本番環境では独自ドメインに変更します
      to: ['onboarding@resend.dev'], // ダミーの宛先（必須）
      bcc: followerEmails,           // ここにフォロワー全員のアドレスを入れて一斉送信
      subject: `【Searcrate】${authorName}さんが新しいツールを公開しました！`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>新しいツールが追加されました！🚀</h2>
          <p>あなたがフォローしている <strong>${authorName}</strong> さんが、新作ツール「<strong>${toolName}</strong>」を公開しました。</p>
          <br/>
          <a href="https://searcrate.com/tool/${toolId}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
            さっそくツールを見に行く
          </a>
        </div>
      `,
    });

    if (emailError) throw emailError;

    return NextResponse.json({ success: true, message: '通知メールを送信しました' });
  } catch (error) {
    console.error('Notify API Error:', error);
    return NextResponse.json({ error: '処理に失敗しました' }, { status: 500 });
  }
}