"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import StockBar from '../components/StockBar';

// ツールの型定義
type Tool = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  price_model: string;
  image_url: string;
  tags: string[];
  view_count: number;
  rating: number;
  plans?: any[];
};

// 動画判定
const isVideo = (src?: string) => {
  if (!src) return false;
  return src.startsWith('data:video') || src.match(/\.(mp4|webm|mov)$/i) !== null;
};

// メディア表示コンポーネント
const ToolCardMedia = ({ src, alt }: { src: string, alt: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // PC用: ホバーで再生
  const handleMouseEnter = () => {
    setIsHovered(true);
    // スマホ以外ならホバーで再生
    if (window.matchMedia('(hover: hover)').matches && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (window.matchMedia('(hover: hover)').matches && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // ★追加: スマホ用 (画面内に入ったら自動再生)
  useEffect(() => {
    // ホバーができないデバイス（スマホ・タブレット）のみ実行
    if (window.matchMedia('(hover: none)').matches && isVideo(src)) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // 画面に入った
              videoRef.current?.play().catch(() => {});
            } else {
              // 画面から出た
              videoRef.current?.pause();
            }
          });
        },
        { threshold: 0.6 } // 60%見えたら再生開始
      );

      if (videoRef.current) {
        observer.observe(videoRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }
  }, [src]);

  if (isVideo(src)) {
    return (
      <div 
        className="w-full h-full relative bg-black flex items-center justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          src={src}
          muted 
          loop 
          playsInline // スマホでインライン再生するために必須
          className="w-full h-full object-contain"
        />
        {/* ホバーしていない、かつスマホでない場合にラベルを表示 */}
        {!isHovered && (
          <div className="hidden md:block absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur font-bold z-10 pointer-events-none">
            ▶ Video
          </div>
        )}
      </div>
    );
  }

  // srcが存在し、かつ動画でない場合の処理
  return (src && isVideo(src) === false && (src.startsWith('http') || src.startsWith('data:'))) ? (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
      />
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center text-7xl group-hover:scale-110 transition-transform select-none">
      {src || '📦'}
    </div>
  );
};

export default function Home() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 検索・フィルター状態
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [filterOneTime, setFilterOneTime] = useState(false);
  const [sortBy, setSortBy] = useState<'recommend' | 'popular' | 'dig' | 'price'>('recommend');

  // データ取得
  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error:', error);
      } else {
        setTools(data || []);
      }
      setLoading(false);
    };
    fetchTools();
  }, []);

  // #入力時のタグ候補算出ロジック
  const allTags = Array.from(new Set(tools.flatMap(tool => tool.tags || [])));
  const showSuggestions = searchQuery.trim().startsWith('#');
  const suggestionKeyword = showSuggestions ? searchQuery.trim().slice(1).toLowerCase() : '';
  
  const suggestedTags = showSuggestions 
    ? allTags.filter(tag => 
        tag.toLowerCase().includes(suggestionKeyword) && 
        !activeTags.includes(tag)
      ).slice(0, 8)
    : [];

  const handleSelectTag = (tag: string) => {
    setActiveTags([...activeTags, tag]);
    setSearchQuery(''); 
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim().startsWith('#')) {
        e.preventDefault();
        const newTag = searchQuery.trim().substring(1); // #を取り除く
        if (newTag && !activeTags.includes(newTag)) {
          setActiveTags([...activeTags, newTag]);
          setSearchQuery('');
        }
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setActiveTags(activeTags.filter(tag => tag !== tagToRemove));
  };

  // フィルタリングロジック
  const filteredTools = tools.filter((tool) => {
    const searchTarget = `${tool.name} ${tool.tagline} ${tool.tags?.join(' ') || ''}`.toLowerCase();
    
    // 文字列検索
    const matchesQuery = searchQuery 
      ? searchTarget.includes(searchQuery.toLowerCase()) 
      : true;

    // タグ検索 (アクティブなタグすべてを含むか)
    const matchesTags = activeTags.length === 0 || activeTags.every(tag => {
      const cleanTag = tag.toLowerCase();
      return (
        tool.tags?.some(t => t.toLowerCase().includes(cleanTag)) ||
        tool.tagline?.toLowerCase().includes(cleanTag)
      );
    });

    // 買い切りフィルター
    const matchesOneTime = filterOneTime 
      ? (tool.price_model === 'one_time' || tool.plans?.some((p:any) => p.type === 'one_time')) 
      : true;

    return matchesQuery && matchesTags && matchesOneTime;
  });

  // ソートロジック
  const sortedTools = [...filteredTools].sort((a, b) => {
    switch (sortBy) {
      case 'popular': return (b.view_count || 0) - (a.view_count || 0);
      case 'dig': return (a.view_count || 0) - (b.view_count || 0);
      case 'price': return a.price - b.price;
      case 'recommend': default: return (b.rating || 0) - (a.rating || 0);
    }
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black font-black text-xl">読み込み中...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="bg-white border-b border-gray-200 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-4xl sm:text-6xl font-black text-black tracking-tighter leading-none mb-6">
                掘り出しツールを、<br/><span className="text-orange-600">箱買い</span>しよう。
              </h1>
              
              {/* 検索バーエリア */}
              <div className="relative w-full z-30">
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="キーワード / #タグ (Enterで追加)" 
                   className="w-full bg-gray-100 border-2 border-transparent focus:bg-white focus:border-black rounded-full py-4 px-6 font-bold text-lg !text-black placeholder:text-gray-500 outline-none transition-all"
                   style={{ color: '#000000', opacity: 1 }} 
                 />
                 <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 text-xl">🔍</span>

                 {/* タグ候補リスト (入力中のみ表示) */}
                 {showSuggestions && suggestedTags.length > 0 && (
                   <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                     <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-400 border-b border-gray-100 flex justify-between">
                       <span>タグ候補</span>
                       <span>選んで追加</span>
                     </div>
                     <div className="max-h-60 overflow-y-auto">
                       {suggestedTags.map(tag => (
                         <button
                           key={tag}
                           onClick={() => handleSelectTag(tag)}
                           className="w-full text-left px-5 py-3 hover:bg-blue-50 flex items-center justify-between transition-colors border-b border-gray-50 last:border-none group"
                         >
                           <span className="font-bold text-gray-700 group-hover:text-blue-700 text-base">#{tag}</span>
                           <span className="text-gray-300 text-sm group-hover:text-blue-400">＋</span>
                         </button>
                       ))}
                     </div>
                   </div>
                 )}
              </div>

              {/* 選択中のタグ表示 */}
              {activeTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {activeTags.map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => removeTag(tag)}
                      className="bg-black text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 hover:bg-gray-800 transition-colors"
                    >
                      #{tag} <span className="text-xs">✕</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 px-5 py-4 rounded-xl border border-gray-200 shadow-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={filterOneTime}
                  onChange={() => setFilterOneTime(!filterOneTime)}
                  className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
                />
                <span className="text-base font-bold text-gray-900">📦 買い切りのみ表示</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ソートタブ */}
        <div className="flex space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {[
            { id: 'recommend', label: '✨ おすすめ', desc: '失敗しない選択' },
            { id: 'popular', label: '👑 定番人気', desc: 'みんな使ってる' },
            { id: 'dig', label: '⛏️ ディグる', desc: '隠れた名作発掘' },
            { id: 'price', label: '💰 コスパ順', desc: '安い順' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSortBy(tab.id as any)}
              className={`flex flex-col items-center px-5 py-3 rounded-xl border transition-all whitespace-nowrap min-w-[120px] ${
                sortBy === tab.id 
                  ? 'bg-black text-white border-black shadow-lg transform scale-105' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              <span className="text-sm font-black">{tab.label}</span>
              <span className={`text-[10px] font-bold mt-1 ${sortBy === tab.id ? 'text-gray-300' : 'text-gray-500'}`}>{tab.desc}</span>
            </button>
          ))}
        </div>

        {/* ツール一覧 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedTools.map((tool) => (
            <Link href={`/tool/${tool.id}`} key={tool.id} className="block group h-full">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-2xl hover:border-gray-300 transition-all duration-300 overflow-hidden h-full flex flex-col hover:-translate-y-1">
                
                {/* 画像エリア */}
                <div className="h-48 bg-gray-50 overflow-hidden relative border-b border-gray-100">
                  <ToolCardMedia src={tool.image_url} alt={tool.name} />
                  
                  {/* PV数バッジ */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur font-black pointer-events-none">
                     👀 {tool.view_count || 0}
                  </div>
                </div>
                
                {/* コンテンツエリア */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap gap-1 content-start">
                      {/* プランの種類を表示 */}
                      {Array.from(new Set(tool.plans?.map((p: any) => p.type) || [tool.price_model])).map((type: any) => (
                        <span key={type} className={`inline-block px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider border ${
                          type === 'one_time' ? 'bg-orange-50 text-orange-900 border-orange-200' : 
                          type === 'oss' ? 'bg-green-50 text-green-900 border-green-200' : 
                          'bg-blue-50 text-blue-900 border-blue-200'
                        }`}>
                          {type === 'one_time' ? 'One-time' : type === 'subscription' ? 'Sub' : type}
                        </span>
                      ))}
                    </div>
                    <p className="text-xl font-black text-gray-900 whitespace-nowrap ml-2">
                       {tool.price === 0 ? 'Free' : `¥${tool.price.toLocaleString()}`}
                    </p>
                  </div>

                  <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight group-hover:text-blue-700 transition-colors line-clamp-1">
                    {tool.name}
                  </h3>
                  
                  <p className="text-xs text-gray-700 font-bold line-clamp-2 min-h-[2.5em] mb-4 leading-relaxed">
                    {tool.tagline}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {tool.tags?.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200 group-hover:border-gray-300 transition-colors">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && sortedTools.length === 0 && (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 mt-8">
            <p className="text-gray-400 text-5xl mb-4">📭</p>
            <p className="text-gray-900 text-xl font-black mb-2">条件に合うツールは見つかりませんでした...</p>
            <button onClick={() => {setSearchQuery(''); setActiveTags([]); setFilterOneTime(false);}} className="text-blue-600 font-bold text-lg hover:underline hover:text-blue-800 transition-colors">条件をリセットする</button>
          </div>
        )}
      </div>
      <StockBar />
    </main>
  );
}