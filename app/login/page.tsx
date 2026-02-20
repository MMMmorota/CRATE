"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ▼▼▼ Googleログイン用の処理 ▼▼▼
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      alert("Googleログインエラー: " + error.message);
      setLoading(false);
    }
  };

  // ▼▼▼ 追加: Discordログイン用の処理 ▼▼▼
  const handleDiscordLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      alert("Discordログインエラー: " + error.message);
      setLoading(false);
    }
  };
  // ▲▲▲ 追加ここまで ▲▲▲

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // 新規登録
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        alert("登録エラー: " + error.message);
      } else {
        alert("登録完了！ログインされました。");
        router.push('/'); // トップ(検索)へ戻る
      }
    } else {
      // ログイン
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert("ログインエラー: " + error.message);
      } else {
        router.push('/'); // トップ(検索)へ戻る
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 relative">
        
        {/* 検索に戻るリンク */}
        <div className="absolute top-6 left-6">
          <Link href="/" className="text-xs font-bold text-gray-400 hover:text-black transition-colors">
            ← 検索に戻る
          </Link>
        </div>

        {/* ロゴ */}
        <div className="text-center mb-8 mt-4">
          <Link href="/" className="text-3xl font-black tracking-tighter text-gray-900 inline-block border-2 border-black p-1 px-2">
            CRATE
          </Link>
          <p className="mt-2 text-gray-500 text-sm font-bold">
            {isSignUp ? 'アカウントを作成してツールを投稿しよう' : 'おかえりなさい'}
          </p>
        </div>

        {/* Googleログインボタン */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
          className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-3 mb-3"
        >
          {/* GoogleのロゴSVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Googleで{isSignUp ? '登録' : 'ログイン'}
        </button>

        {/* ▼▼▼ 追加: Discordログインボタン ▼▼▼ */}
        <button 
          onClick={handleDiscordLogin}
          disabled={loading}
          type="button"
          className="w-full bg-[#5865F2] text-white py-3.5 rounded-xl font-bold hover:bg-[#4752C4] transition-all active:scale-95 shadow-sm flex items-center justify-center gap-3 mb-6"
        >
          {/* DiscordのロゴSVG */}
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 127.14 96.36">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.1,46,96,53,91.08,65.69,84.69,65.69Z" />
          </svg>
          Discordで{isSignUp ? '登録' : 'ログイン'}
        </button>
        {/* ▲▲▲ 追加ここまで ▲▲▲ */}

        {/* 区切り線 */}
        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-3 text-xs font-bold text-gray-400">またはメールアドレスで</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">メールアドレス</label>
            <input 
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none font-bold text-gray-900 placeholder-gray-400"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">パスワード</label>
                {/* 忘れた方リンク (ログイン時のみ表示) */}
                {!isSignUp && (
                  <Link href="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                    忘れた方はこちら
                  </Link>
                )}
            </div>
            <input 
              type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none font-bold text-gray-900 placeholder-gray-400"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-transform active:scale-95 shadow-lg"
          >
            {loading ? '処理中...' : (isSignUp ? 'メールアドレスで登録' : 'メールアドレスでログイン')}
          </button>
        </form>

        <div className="mt-8 text-center bg-gray-50 p-4 rounded-lg">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-gray-600 hover:text-black font-bold underline decoration-gray-300 underline-offset-4"
          >
            {isSignUp ? 'すでにアカウントをお持ちの方はこちら' : 'アカウントを新規作成する'}
          </button>
        </div>

      </div>
    </main>
  );
}