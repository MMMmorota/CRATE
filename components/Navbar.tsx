"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ログイン状態チェック
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    
    // 状態変化の監視
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      // トップページに検索キーワード（?q=ワード）をつけて移動する
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-200 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-2 sm:gap-4">
          
          {/* 1. ロゴ */}
          <Link href="/" className="text-2xl font-black text-black tracking-tighter shrink-0 border-2 border-black px-2 hover:bg-black hover:text-white transition-colors">
            SEARCRATE
          </Link>

          {/* 2. 検索バー (PC: 常時表示 / スマホ: 非表示) */}
          {pathname !== '/about' && (
            <div className="hidden md:block flex-1 max-w-lg mx-4">
               <div className="relative group">
                 <input 
                   type="text" 
                   placeholder="ツールを探す..." 
                   // ★ ここを修正: text-black と placeholder:text-gray-400 を追加
                   className="w-full bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-black rounded-full py-2.5 px-5 text-sm font-bold text-black placeholder:text-gray-400 transition-all outline-none"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyDown={handleSearch}
                 />
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
               </div>
            </div>
          )}

          {/* 3. 右側のメニュー (レスポンシブ対応) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Aboutページ以外の時だけ表示するグループ（💡と🔍） */}
            {pathname !== '/about' && (
              <>
                <Link 
                  href="/about" 
                  className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-black transition-colors mr-1 sm:mr-2"
                  title="SEARCRATEについて"
                >
                  <span className="text-xl leading-none">💡</span>
                  <span className="hidden md:inline">SEARCRATEについて</span>
                </Link>
                
                {/* スマホのみ: 検索トグルボタン */}
                <button 
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                  className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-lg transition-colors"
                >
                  {showMobileSearch ? '✕' : '🔍'}
                </button>
              </>
            )}

            {/* サービス掲載ボタン */}
            <Link 
              href="/submit" 
              className="bg-black text-white h-10 px-3 sm:px-5 rounded-full font-bold text-xs sm:text-sm hover:bg-gray-800 transition-all flex items-center gap-1 shadow-lg active:scale-95"
            >
              <span className="text-lg leading-none font-light">+</span>
              <span className="hidden sm:inline">サービスを掲載</span>
            </Link>

            {/* ログイン / マイページ */}
            {user ? (
              <Link href="/mypage" className="flex items-center gap-2 text-black font-bold hover:opacity-70 transition-opacity group">
                 <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-full flex items-center justify-center border border-gray-200 transition-colors">
                   <span className="text-xl">👤</span>
                 </div>
                 <span className="hidden sm:inline text-sm">マイページ</span>
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="text-sm font-bold text-black border-2 border-black h-10 px-4 rounded-full hover:bg-black hover:text-white transition-all flex items-center"
              >
                <span className="hidden sm:inline">ログイン</span>
                <span className="sm:hidden">Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* 4. スマホ用検索バー (トグルで表示) */}
        {showMobileSearch && pathname !== '/about' && (
          <div className="md:hidden px-4 pb-4 border-b border-gray-100 bg-white/95 backdrop-blur animate-in slide-in-from-top-2">
             <div className="relative">
               <input 
                 type="text" 
                 placeholder="キーワード検索..." 
                 // ★ ここを修正: text-black と placeholder:text-gray-400 を追加
                 className="w-full bg-gray-100 border-none focus:ring-2 focus:ring-black rounded-xl py-3 px-4 font-bold text-black placeholder:text-gray-400 outline-none"
                 autoFocus
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={handleSearch}
               />
               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
             </div>
          </div>
        )}
      </nav>
      <div className="h-16" />
    </>
  );
}