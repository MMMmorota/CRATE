import type { Metadata } from 'next';
import './globals.css';
import { StockProvider } from '../context/StockContext'; // 👈 追加
import StockBar from '../components/StockBar';           // 👈 追加

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
      <body>
        {/* アプリ全体をStockProviderで囲む */}
        <StockProvider>
          {children}
          {/* ストックバーを常に表示 */}
          <StockBar />
        </StockProvider>
      </body>
    </html>
  );
}