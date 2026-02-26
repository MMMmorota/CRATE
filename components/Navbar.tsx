"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

// ▼▼▼ 新しく追加した SEARCRATE ロゴコンポーネント（SVG） ▼▼▼
const SearcrateLogo = ({ className = "w-10 h-10" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <defs>
      <clipPath id="lens-clip">
        <circle cx="65" cy="65" r="26" />
      </clipPath>
    </defs>
    
    {/* ★変更: 外側の線画をしっかりとした真っ黒（#111827）の太線にしました */}
    <g stroke="#111827" strokeWidth="3" fill="none" strokeLinejoin="round">
      <polygon points="50,15 85,35 50,55 15,35" />
      <polygon points="15,35 50,55 50,95 15,75" />
      <polygon points="50,55 85,35 85,75 50,95" />
      <line x1="15" y1="35" x2="50" y2="95" />
      <line x1="15" y1="75" x2="50" y2="55" />
      <line x1="50" y1="55" x2="85" y2="75" />
      <line x1="85" y1="35" x2="50" y2="95" />
    </g>

    {/* レンズを通した時だけ見える「本来の色と熱量」（内側） */}
    <g clipPath="url(#lens-clip)">
      <circle cx="65" cy="65" r="26" fill="#111827" />
      <g stroke="#111827" strokeWidth="3" strokeLinejoin="round">
        <polygon points="50,15 85,35 50,55 15,35" fill="#D97706" />
        <polygon points="15,35 50,55 50,95 15,75" fill="#B45309" />
        <polygon points="50,55 85,35 85,75 50,95" fill="#92400E" />
        <line x1="15" y1="35" x2="50" y2="95" stroke="#F59E0B" strokeWidth="2.5" />
        <line x1="15" y1="75" x2="50" y2="55" stroke="#F59E0B" strokeWidth="2.5" />
        <line x1="50" y1="55" x2="85" y2="75" stroke="#F59E0B" strokeWidth="2.5" />
        <line x1="85" y1="35" x2="50" y2="95" stroke="#F59E0B" strokeWidth="2.5" />
      </g>
    </g>
    {/* 検索レンズのフレーム */}
    <circle cx="65" cy="65" r="26" stroke="#111827" strokeWidth="4" fill="none" />
    <line x1="83" y1="83" x2="96" y2="96" stroke="#111827" strokeWidth="6" strokeLinecap="round" />
  </svg>
);
// ▲▲▲ ロゴコンポーネントここまで ▲▲▲

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-200 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-2 sm:gap-4">
          
          {/* ▼▼▼ 1. ロゴ部分をアイコン＋テキストのモダンなデザインに変更 ▼▼▼ */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            {/* アイコン（ホバー時に少しだけフワッと大きくなるアニメーション付き） */}
            <SearcrateLogo className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-110 duration-300" />
            <span className="text-xl sm:text-2xl font-black text-black tracking-tighter">
              SEARCRATE
            </span>
          </Link>
          {/* ▲▲▲ 変更ここまで ▲▲▲ */}

          {/* 2. 検索バー (PC: 常時表示 / スマホ: 非表示) */}
          {pathname !== '/about' && (
            <div className="hidden md:block flex-1 max-w-lg mx-4">
               <div className="relative group">
                 <input 
                   type="text" 
                   placeholder="ツールを探す..." 
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
                
                <button 
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                  className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-lg transition-colors"
                >
                  {showMobileSearch ? '✕' : '🔍'}
                </button>
              </>
            )}

            <Link 
              href="/submit" 
              className="bg-black text-white h-10 px-3 sm:px-5 rounded-full font-bold text-xs sm:text-sm hover:bg-gray-800 transition-all flex items-center gap-1 shadow-lg active:scale-95"
            >
              <span className="text-lg leading-none font-light">+</span>
              <span className="hidden sm:inline">サービスを掲載</span>
            </Link>

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