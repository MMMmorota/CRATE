"use client";

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Supabaseに「再設定メール」の送信を依頼
    // リンクをクリックした後の飛び先を /update-password に指定
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/update-password',
    });

    if (error) {
      alert('エラー: ' + error.message);
    } else {
      setMessage('再設定メールを送信しました！メール内のリンクをクリックしてください。');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 relative">
        
        <div className="absolute top-6 left-6">
          <Link href="/login" className="text-xs font-bold text-gray-400 hover:text-black transition-colors">
            ← ログインに戻る
          </Link>
        </div>

        <div className="text-center mb-8 mt-4">
          <h1 className="text-2xl font-black text-gray-900">パスワード再設定</h1>
          <p className="mt-2 text-gray-500 text-sm font-bold">
            登録したメールアドレスを入力してください。<br/>再設定用のリンクをお送りします。
          </p>
        </div>

        {message ? (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-800 text-sm font-bold text-center">
            {message}
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">メールアドレス</label>
              <input 
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none font-bold text-gray-900 placeholder-gray-400"
                placeholder="user@example.com"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-transform active:scale-95 shadow-lg"
            >
              {loading ? '送信中...' : '再設定メールを送る'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}