import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { StockProvider } from '../context/StockContext';
// ▼▼▼ 追加: 広告コンポーネントのインポート ▼▼▼
import GoogleAdsense from '../components/GoogleAdsense';

const inter = Inter({ subsets: ['latin'] });

// ▼▼▼ ここがサイト全体の最強SEO設定（本家本元アピール） ▼▼▼
export const metadata: Metadata = {
  metadataBase: new URL('https://searcrate.com'), // ★超重要: サイトの基準URLを宣言
  title: 'SEARCRATE (サークレート) - 個人開発・インディー作品の発掘サイト',
  description: '「SEARCRATE (サークレート)」は、個人開発者やインディークリエイターが情熱を込めて作ったゲーム、Webサービス、便利ツールなどの「隠れた名作」を発掘できる検索プラットフォームです。',
  
  // ★追加: Googleに「このキーワードで検索されたい！」とアピールする
  keywords: ['SEARCRATE', 'サークレート', '個人開発', 'インディーゲーム', 'Webサービス', '個人アプリ', '名作発掘'],
  
  // ★追加: OGP（XやFacebookでURLが貼られた時のリッチな表示設定）
  openGraph: {
    title: 'SEARCRATE (サークレート) - 個人開発・インディー作品の発掘サイト',
    description: '個人開発の「隠れた名作」を集める場所。星の数ほどあるWebサイトやアプリストアの中に埋もれた、情熱の詰まった作品に出会えます。',
    url: 'https://searcrate.com',
    siteName: 'SEARCRATE',
    locale: 'ja_JP',
    type: 'website',
  },
  
  // ★追加: X（旧Twitter）用の表示設定
  twitter: {
    card: 'summary_large_image',
    title: 'SEARCRATE (サークレート) - 個人開発の発掘サイト',
    description: '個人開発の「隠れた名作」を発掘しよう。',
  },

  // 既存のGoogle連携設定
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
        {/* 審査に受かったらここに本物のIDを入れる: ca-pub-xxxxxxxxxxxxxxxx */}
       <GoogleAdsense pId="ca-pub-5380139527884615" /> 
        
        <StockProvider>
          {/* メインコンテンツとフッターを並べるためのラッパー */}
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            
            {/* フッター */}
            <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
              <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-gray-500 font-bold">© {new Date().getFullYear()} SEARCRATE. All rights reserved.</p>
                <div className="flex gap-6">
                  <a href="/about" className="text-xs text-gray-500 hover:text-gray-900 font-bold transition-colors">SEARCRATEについて</a>
                  <a href="/privacy" className="text-xs text-gray-500 hover:text-gray-900 font-bold transition-colors">プライバシーポリシー</a>
                  <a href="/contact" className="text-xs text-gray-500 hover:text-gray-900 font-bold transition-colors">お問い合わせ</a>
                </div>
              </div>
            </footer>
          </div>
        </StockProvider>
      </body>
    </html>
  );
}