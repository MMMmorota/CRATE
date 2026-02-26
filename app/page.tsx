"use client";

import { useState, useEffect, useRef, Suspense } from 'react'; // ★ Suspense を追加
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // ★これを追加！
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

  const handleMouseEnter = () => {
    setIsHovered(true);
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

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches && isVideo(src)) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              videoRef.current?.play().catch(() => {});
            } else {
              videoRef.current?.pause();
            }
          });
        },
        { threshold: 0.6 }
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
          playsInline
          className="w-full h-full object-contain"
        />
        {!isHovered && (
          <div className="hidden md:block absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur font-bold z-10 pointer-events-none">
            ▶ Video
          </div>
        )}
      </div>
    );
  }

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

// ▼▼▼ 新規追加: マウスに追従して中身が見える巨大木箱コンポーネント ▼▼▼
const InteractiveHeroBox = () => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div 
      className="w-full h-full relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 50, y: 50 }); // 離れたら真ん中に戻す
      }}
      onMouseMove={handleMouseMove}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className={`w-full h-full transition-transform duration-500 drop-shadow-2xl ${isHovered ? 'scale-105 cursor-none' : 'scale-100'}`}
      >
        <defs>
          <clipPath id="hero-lens-clip">
            <circle cx={mousePos.x} cy={mousePos.y} r={isHovered ? "24" : "0"} className="transition-all duration-300 ease-out" />
          </clipPath>
        </defs>

        {/* ★変更: 外側の線画を真っ黒(#111827)にしました */}
        <g stroke="#111827" strokeWidth="3" fill="none" strokeLinejoin="round">
          <polygon points="50,15 85,35 50,55 15,35" />
          <polygon points="15,35 50,55 50,95 15,75" />
          <polygon points="50,55 85,35 85,75 50,95" />
          <line x1="15" y1="35" x2="50" y2="95" />
          <line x1="15" y1="75" x2="50" y2="55" />
          <line x1="50" y1="55" x2="85" y2="75" />
          <line x1="85" y1="35" x2="50" y2="95" />
        </g>

        <g clipPath="url(#hero-lens-clip)">
          <circle cx={mousePos.x} cy={mousePos.y} r="24" fill="#111827" />
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

        {isHovered && (
          <g className="pointer-events-none">
            <circle cx={mousePos.x} cy={mousePos.y} r="24" stroke="#111827" strokeWidth="3" fill="none" />
            <line x1={mousePos.x + 16} y1={mousePos.y + 16} x2={mousePos.x + 28} y2={mousePos.y + 28} stroke="#111827" strokeWidth="5" strokeLinecap="round" />
            <path d={`M ${mousePos.x - 14} ${mousePos.y - 8} A 16 16 0 0 1 ${mousePos.x - 2} ${mousePos.y - 20}`} stroke="white" strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round" />
          </g>
        )}
      </svg>
      
      {!isHovered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-black/5 text-gray-500 font-bold text-xs px-4 py-2 rounded-full animate-bounce shadow-sm">
            箱を探ってみよう 🔍
          </span>
        </div>
      )}
    </div>
  );
};
// ▲▲▲ 巨大木箱コンポーネントここまで ▲▲▲

// ★ ここを Home から HomeContent に名前変更しました！
function HomeContent() {
  const searchParams = useSearchParams(); 
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 検索・フィルター状態
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [filterOneTime, setFilterOneTime] = useState(false);
  const [sortBy, setSortBy] = useState<'recommend' | 'popular' | 'dig' | 'price'>('recommend');

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);
  
  // ページネーション用の状態
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20; // 1ページあたりの表示数

  // 検索やフィルターが変更されたら、1ページ目に戻す処理
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTags, filterOneTime, sortBy]);

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

  const allTags = Array.from(new Set(tools.flatMap(tool => tool.tags || [])));
  const showSuggestions = searchQuery.trim().startsWith('#');
  const suggestionKeyword = showSuggestions ? searchQuery.trim().slice(1).toLowerCase() : '';
  
  const suggestedTags = showSuggestions 
    ? allTags.filter(tag => 
        tag.toLowerCase().includes(suggestionKeyword) && 
        !activeTags.includes(tag)
      ).slice(0, 8)
    : [];

  // ★ 修正: 同じタグが重複して追加されないように防御！
  const handleSelectTag = (tag: string) => {
    if (!activeTags.includes(tag)) {
      setActiveTags([...activeTags, tag]);
    }
    setSearchQuery(''); 
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim().startsWith('#')) {
        e.preventDefault();
        const newTag = searchQuery.trim().substring(1);
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
    
    const matchesQuery = searchQuery 
      ? searchTarget.includes(searchQuery.toLowerCase()) 
      : true;

    const matchesTags = activeTags.length === 0 || activeTags.every(tag => {
      const cleanTag = tag.toLowerCase();
      return (
        tool.tags?.some(t => t.toLowerCase().includes(cleanTag)) ||
        tool.tagline?.toLowerCase().includes(cleanTag)
      );
    });

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

  // 現在のページに表示するツールを切り出す処理
  const totalPages = Math.ceil(sortedTools.length / ITEMS_PER_PAGE);
  const currentTools = sortedTools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ページ切り替え時のスクロール処理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black font-black text-xl">読み込み中...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      {/* ▼▼▼ ここからヒーローセクション（赤丸のエリア） ▼▼▼ */}
          <div className="bg-white border-b border-gray-200 pt-12 pb-16 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                
                {/* 左側：メインのテキストと検索バー */}
                <div className="flex-1 max-w-2xl w-full relative z-20">
                  <h1 className="text-4xl sm:text-6xl font-black text-black tracking-tighter leading-none mb-6">
                    個人開発の<br/><span className="text-orange-600">「名作」</span>を発掘しよう。
                  </h1>
                  
                  <div className="relative w-full z-30 mb-4">
                     <input 
                       type="text" 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       onKeyDown={handleKeyDown}
                       placeholder="キーワード / #タグ (Enterで追加)" 
                       className="w-full bg-gray-100 border-2 border-transparent focus:bg-white focus:border-black rounded-full py-4 px-6 font-bold text-lg text-black placeholder:text-gray-500 outline-none transition-all shadow-sm"
                     />
                     <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 text-xl">🔍</span>

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

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-gray-400 mr-1">人気のカテゴリ:</span>
                    {['ゲーム', '便利ツール', 'SaaS', 'AI', '音楽・画像', 'Bot'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleSelectTag(tag)}
                        className="px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all hover:-translate-y-0.5 active:translate-y-0 bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black shadow-sm"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {activeTags.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-3 mb-6">
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

                  <div className="flex items-center gap-2 bg-gray-50 px-5 py-4 rounded-xl border border-gray-200 shadow-sm inline-flex mt-2">
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

                {/* 右側：巨大なインタラクティブ木箱（ご指定の赤丸エリアにドドンと配置！） */}
                {/* ★ 隠れないように flex に修正し、後ろに光るエフェクトを追加しました ★ */}
                <div className="flex justify-center items-center w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[450px] lg:h-[450px] relative z-10 mt-8 lg:mt-0 mx-auto">
                  <div className="absolute inset-0 bg-orange-200 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                  <InteractiveHeroBox />
                </div>

              </div>
            </div>
          </div>
          {/* ▲▲▲ ヒーローセクションここまで ▲▲▲ */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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

        {/* ツール一覧 (現在のページ分だけ表示) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
          {currentTools.map((tool, index) => {
            // ★ ランキング順位の計算
            const rank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
            const isPopular = sortBy === 'popular';

            return (
              <Link href={`/tool/${tool.id}`} key={tool.id} className="block group h-full">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-2xl hover:border-gray-300 transition-all duration-300 overflow-hidden h-full flex flex-col hover:-translate-y-1 relative">
                  
                  {/* ▼▼▼ 追加: 定番人気タブの時のランキングバッジ ▼▼▼ */}
                  {isPopular && (
                    <div className={`absolute -top-3 -left-3 flex items-center justify-center font-black text-white rounded-full z-20 shadow-lg border-2 border-white ${
                      rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 w-14 h-14 text-2xl transform -rotate-12' :
                      rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 w-12 h-12 text-xl transform -rotate-6' :
                      rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 w-12 h-12 text-xl transform rotate-6' :
                      'bg-gray-800 w-10 h-10 text-base'
                    }`}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                    </div>
                  )}
                  {/* ▲▲▲ 追加ここまで ▲▲▲ */}

                  <div className="h-48 bg-gray-50 overflow-hidden relative border-b border-gray-100">
                    <ToolCardMedia src={tool.image_url} alt={tool.name} />
                    
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur font-black pointer-events-none z-10">
                       👀 {tool.view_count || 0}
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-wrap gap-1 content-start">
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
            );
          })}
        </div>

        {!loading && sortedTools.length === 0 && (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 mt-8">
            <p className="text-gray-400 text-5xl mb-4">📭</p>
            <p className="text-gray-900 text-xl font-black mb-2">条件に合うツールは見つかりませんでした...</p>
            <button onClick={() => {setSearchQuery(''); setActiveTags([]); setFilterOneTime(false);}} className="text-blue-600 font-bold text-lg hover:underline hover:text-blue-800 transition-colors">条件をリセットする</button>
          </div>
        )}

        {/* ページネーションUI */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center mt-12 gap-2">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
            >
              ← 前へ
            </button>

            <div className="flex gap-1 overflow-x-auto scrollbar-hide px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-lg transition-all ${
                    currentPage === page
                      ? 'bg-black text-white border-black shadow-md transform scale-105'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
            >
              次へ →
            </button>
          </div>
        )}

      </div>
      <StockBar />
    </main>
  );
}

// ★ 一番下のこの部分はそのままです！
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-black font-black text-xl">読み込み中...</div>}>
      <HomeContent />
    </Suspense>
  );
}