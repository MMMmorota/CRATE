import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { StockProvider } from '../context/StockContext';
// ▼▼▼ 追加: 広告コンポーネントのインポート ▼▼▼
import GoogleAdsense from '../components/GoogleAdsense';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRATE - 買い切りツールの道具箱',
  description: 'SaaS疲れのための、買い切り・オフラインツール検索エンジン',
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
        <GoogleAdsense pId="ca-pub-0000000000000000" /> 
        
        <StockProvider>
          {children}
        </StockProvider>
      </body>
    </html>
  );
}