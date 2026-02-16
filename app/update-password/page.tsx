"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // そもそもリンク経由でログインできているかチェック
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert('有効期限切れか、無効なリンクです。もう一度やり直してください。');
        router.push('/forgot-password');
      }
    });
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // パスワードを上書き更新
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      alert('エラー: ' + error.message);
    } else {
      alert('パスワードを変更しました！新しいパスワードでログインしてください。');
      router.push('/'); // トップへ
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900">新しいパスワードの設定</h1>
          <p className="mt-2 text-gray-500 text-sm font-bold">
            忘れないように新しいパスワードを入力してください。
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">新しいパスワード</label>
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
            {loading ? '変更する' : 'パスワードを変更'}
          </button>
        </form>
      </div>
    </main>
  );
}