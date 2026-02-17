"use client";

import Link from 'next/link';
import { useStock } from '../context/StockContext';

// 動画判定用の関数
const isVideo = (src?: string) => {
  if (!src) return false;
  return src.startsWith('data:video') || src.match(/\.(mp4|webm|mov)$/i) !== null;
};

export default function StockBar() {
  const { items, removeItem } = useStock();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 animate-slide-up">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        
        {/* リスト部分 */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide flex-1 mr-4">
          {items.map((item) => (
            <div key={item.id} className="relative group flex-shrink-0">
              <Link 
                href={`/tool/${item.id}`}
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-2 pr-4 hover:bg-gray-100 transition-colors"
              >
                {/* ▼▼▼ 画像・動画・テキストの出し分け (修正版) ▼▼▼ */}
                <div className="w-10 h-10 bg-white rounded overflow-hidden flex items-center justify-center border border-gray-100 flex-shrink-0">
                  {isVideo(item.image) ? (
                    // 1. 動画の場合
                    <video 
                      src={item.image} 
                      className="w-full h-full object-cover" 
                      autoPlay 
                      muted 
                      loop 
                      playsInline 
                    />
                  ) : (
                    // 2. 画像URLの場合 (http... または data:...)
                    (item.image && (item.image.startsWith('http') || item.image.startsWith('data:'))) ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      // 3. それ以外 (絵文字など) の場合
                      <span className="text-xl select-none">{item.image || '📦'}</span>
                    )
                  )}
                </div>
                {/* ▲▲▲ 修正ここまで ▲▲▲ */}
                
                <div className="min-w-[80px]">
                  <p className="text-xs font-bold text-gray-900 truncate max-w-[120px]">{item.name}</p>
                  <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{item.planName}</p>
                  <p className="text-xs font-black text-orange-600">¥{item.price.toLocaleString()}</p>
                </div>
              </Link>

              {/* 削除ボタン */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  removeItem(item.id);
                }}
                className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-sm z-10"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* アクションボタン */}
        <Link 
          href="/compare" 
          className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition-transform active:scale-95 whitespace-nowrap"
        >
          これらで比較する →
        </Link>
      </div>
    </div>
  );
}