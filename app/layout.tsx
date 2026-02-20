import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { StockProvider } from '../context/StockContext';
// ▼▼▼ 追加: 広告コンポーネントのインポート ▼▼▼

import GoogleAdsense from '../components/GoogleAdsense';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRATE - 個人開発・インディー作品の道具箱',
  description: 'ゲーム、Webサービス、便利アプリなど、個人開発者やクリエイターの熱意が詰まった作品を集めた検索プラットフォームです。',
  verification: {
    google: 'ln7MAO9T1qSOeXtXb8mVJ4E8O2D7uWt5qltVsIx_x4I', 
  },
  other: {
    'google-adsense-account': 'ca-pub-5380139527884615',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* ▼▼▼ 追加: AdSense (ID取得後に書き換える) ▼▼▼ */}
        {/* 審査に受かったらここに本物のIDを入れる: ca-pub-xxxxxxxxxxxxxxxx */}
       <GoogleAdsense pId="ca-pub-5380139527884615" /> 
        
        <StockProvider>
          {/* メインコンテンツとフッターを並べるためのラッパー */}
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            
            {/* ▼▼▼ 追加: フッター ▼▼▼ */}
            <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
              <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-gray-500 font-bold">© {new Date().getFullYear()} CRATE. All rights reserved.</p>
                <div className="flex gap-6">
                  <a href="/about" className="text-xs text-gray-500 hover:text-gray-900 font-bold transition-colors">CRATEについて</a>
                  <a href="/privacy" className="text-xs text-gray-500 hover:text-gray-900 font-bold transition-colors">プライバシーポリシー</a>
                  <a href="/contact" className="text-xs text-gray-500 hover:text-gray-900 font-bold transition-colors">お問い合わせ</a>
                </div>
              </div>
            </footer>
            {/* ▲▲▲ 追加ここまで ▲▲▲ */}
          </div>
        </StockProvider>
      </body>
    </html>
  );
}