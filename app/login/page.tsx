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
                {/* ★追加: 忘れた方リンク (ログイン時のみ表示) */}
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
            {loading ? '処理中...' : (isSignUp ? 'アカウント作成' : 'ログイン')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-gray-500 hover:text-black font-bold underline decoration-gray-300 underline-offset-4"
          >
            {isSignUp ? 'すでにアカウントをお持ちの方はこちら' : 'アカウント作成はこちら'}
          </button>
        </div>

      </div>
    </main>
  );
}