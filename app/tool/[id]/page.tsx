"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import CostSimulator from '../../../components/tool/CostSimulator';
import StockBar from '../../../components/StockBar';
import { useStock } from '../../../context/StockContext';
import SmartMedia from '../../../components/SmartMedia';

type PlanData = {
  name: string;
  price: number;
  type: 'one_time' | 'subscription' | 'oss';
  cycle_duration?: number;
  cycle_unit?: 'month' | 'year';
  user_count?: number;
};

type Tool = {
  id: string;
  user_id?: string;
  name: string;
  tagline: string;
  price: number;
  price_model: string;
  image_url: string;
  description: string;
  tags: string[];
  is_offline: boolean;
  developer: string;
  rating: number;
  view_count: number;
  plans: PlanData[];
  screenshots?: string[];
  official_url?: string;
};

type DisplayPlan = {
  id: string;
  name: string;
  price: number;
  type: string;
  desc: string;
  cycle_months: number;
  user_count: number;
  uiTypeLabel: string;
};

type Review = {
  id: string;
  score: number | null;
  comment: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: {
    username: string;
    avatar_url: string;
  };
  replies?: Review[];
};


const VideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  return (
    <div className="relative w-full h-full group cursor-pointer" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        controls={isPlaying}
        playsInline
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handlePause}
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
           <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transform group-hover:scale-110 transition-transform">
             <span className="text-black text-2xl ml-1">▶</span>
           </div>
        </div>
      )}
    </div>
  );
};



export default function ToolDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [tool, setTool] = useState<Tool | null>(null);
  const [publisher, setPublisher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // ★追加: 管理者判定フラグ
  const [isAdmin, setIsAdmin] = useState(false);

  // ▼▼▼ 追加: 返信の開閉状態を管理するステート ▼▼▼
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  // ★追加: ログイン中のユーザーIDを保存する箱
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  // レビュー用ステート
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<{ [key: number]: number }>({1:0, 2:0, 3:0, 4:0, 5:0});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [inputScore, setInputScore] = useState(5);
  const [inputComment, setInputComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("このコメントを削除しますか？")) return;
    const { error } = await supabase.from('ratings').delete().eq('id', reviewId);
    if (error) alert("削除失敗: " + error.message);
    else fetchReviews(); // リストを再読み込み
  };

  const [activePlan, setActivePlan] = useState<DisplayPlan | null>(null);
  const [months, setMonths] = useState(12);
  const [users, setUsers] = useState(1);
  const [saasPrice, setSaasPrice] = useState(2000);

  const { addItem, removeItem, items } = useStock();
  const isStocked = items.some(item => item.id === id);

  const fetchReviews = useCallback(async () => {
    const { data: rawReviews, error } = await supabase
      .from('ratings')
      .select('*, profiles(username, avatar_url)')
      .eq('tool_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("レビュー取得エラー:", error);
      return;
    }

    if (rawReviews) {
      const allReviews = rawReviews as any as Review[];
      const dist = {1:0, 2:0, 3:0, 4:0, 5:0};
      
      const rootReviews: Review[] = [];
      const replyMap: { [key: string]: Review[] } = {};

      allReviews.forEach(r => {
        if (r.parent_id === null && r.score && r.score >= 1 && r.score <= 5) {
          dist[r.score as keyof typeof dist]++;
        }
        if (r.parent_id === null) {
          rootReviews.push({ ...r, replies: [] });
        } else {
          if (!replyMap[r.parent_id]) replyMap[r.parent_id] = [];
          replyMap[r.parent_id].push(r);
        }
      });

      rootReviews.forEach(root => {
        if (replyMap[root.id]) {
          root.replies = replyMap[root.id];
        }
      });

      rootReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setReviews(rootReviews);
      setRatingDistribution(dist);
    }
  }, [id]);


  useEffect(() => {
    const init = async () => {
      await supabase.rpc('increment_view_count', { tool_id: id });

      const { data: toolData, error } = await supabase.from('tools').select('*').eq('id', id).single();
      if (toolData) {
        setTool(toolData);
        if (toolData.user_id) {
           const { data: profileData } = await supabase.from('profiles').select('*').eq('id', toolData.user_id).single();
           if (profileData) setPublisher(profileData);
        }
        await fetchReviews();
      }

      // ★追加: 管理者権限チェック
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id); // ★この行を追加してください！
        
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        if (myProfile?.is_admin) {
          setIsAdmin(true);
        }
      }

      setLoading(false);
    };
    if (id) init();
  }, [id, fetchReviews]);



  // ★追加: 管理者削除機能
  const handleAdminDelete = async () => {
    if (!confirm("⚠️【管理者権限】\n本当にこのツールを削除しますか？\nこの操作は取り消せません。")) return;

    const { error } = await supabase.from('tools').delete().eq('id', id);

    if (error) {
      alert("削除に失敗しました: " + error.message);
    } else {
      alert("管理者権限で削除しました。");
      router.push('/'); // トップへ戻る
    }
  };

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("投稿するにはログインが必要です");
      router.push('/login');
      return;
    }

    const scoreToSend = replyTarget ? null : inputScore;
    const parentIdToSend = replyTarget ? replyTarget.id : null;

    const { error } = await supabase
      .from('ratings')
      .insert({
        user_id: user.id,
        tool_id: id,
        score: scoreToSend,
        comment: inputComment,
        parent_id: parentIdToSend
      });

    if (error) {
      alert("送信エラー: " + error.message);
    } else {
      await fetchReviews(); 
      const { data: updatedTool } = await supabase.from('tools').select('rating').eq('id', id).single();
      if (updatedTool && tool) {
        setTool({ ...tool, rating: updatedTool.rating });
      }

      setShowReviewModal(false);
      setReplyTarget(null);
      setInputComment('');
      alert(replyTarget ? "返信しました！" : "レビューを投稿しました！");
    }
    setIsSubmitting(false);
  };

  const handleReplyClick = (targetReview: Review) => {
    setReplyTarget(targetReview);
    setInputComment('');
    setShowReviewModal(true);
  };

  const openNewReviewModal = () => {
    setReplyTarget(null);
    setInputComment('');
    setShowReviewModal(true);
  };

  const getDisplayPlans = (tool: Tool): DisplayPlan[] => {
    if (tool.plans && tool.plans.length > 0) {
      return tool.plans.map((p, idx) => {
        let cycleMonths = 0;
        if (p.type === 'subscription') {
           const duration = p.cycle_duration || 1;
           cycleMonths = p.cycle_unit === 'year' ? duration * 12 : duration;
        }
        let typeLabel = '';
        if (p.type === 'one_time') typeLabel = '買い切り (One-time)';
        else if (p.type === 'oss') typeLabel = '無料 / OSS';
        else {
           const unitStr = p.cycle_unit === 'year' ? '年' : 'ヶ月';
           const durationStr = (p.cycle_duration && p.cycle_duration > 1) ? p.cycle_duration : '';
           typeLabel = `/${durationStr}${unitStr}`;
        }
        return {
          id: `db_plan_${idx}`,
          name: p.name || `Plan ${idx + 1}`,
          price: p.price,
          type: p.type === 'subscription' ? 'Yearly' : 'One-time',
          desc: p.user_count && p.user_count > 1 ? `${p.user_count}名まで利用可` : '基本プラン',
          cycle_months: cycleMonths,
          user_count: p.user_count || 1,
          uiTypeLabel: typeLabel 
        };
      });
    }
    return [{ id: 'legacy', name: 'Standard', price: tool.price, type: 'One-time', desc: '', cycle_months: 0, user_count: 1, uiTypeLabel: '買い切り' }];
  };

  const displayPlans = tool ? getDisplayPlans(tool) : [];

  useEffect(() => {
    if (!activePlan && displayPlans.length > 0) {
      setActivePlan(displayPlans[0]);
    }
  }, [tool]);

  const handleStockToggle = () => {
    if (!tool) return;
    if (isStocked) removeItem(tool.id);
    else addItem({ id: tool.id, name: tool.name, price: activePlan?.price || tool.price, image: tool.image_url, planName: activePlan?.name || 'Standard' });
  };
  const isVideo = (src?: string) => src ? src.startsWith('data:video') || src.match(/\.(mp4|webm|mov)$/i) !== null : false;

  if (loading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  if (!tool) return <div className="min-h-screen flex items-center justify-center">ツールが見つかりません</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-gray-500 font-bold text-sm hover:text-black transition-colors">← 検索に戻る</Link>
          <div className="flex items-center gap-3">
             {/* ★追加: 管理者用削除ボタン */}
             {isAdmin && (
               <button 
                 onClick={handleAdminDelete}
                 className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-xs font-bold hover:bg-red-200 transition-colors border border-red-200"
               >
                 ⚠️ 強制削除 (Admin)
               </button>
             )}

             <button onClick={handleStockToggle} className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all transform active:scale-95 flex items-center gap-2 ${isStocked ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
               {isStocked ? '✅ 保留リストから外す' : '📌 とりあえず保留する'}
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* ヒーローセクション */}
        <div className="flex flex-col sm:flex-row gap-6 mb-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl flex-shrink-0 shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden">
           <SmartMedia src={tool.image_url} alt={tool.name} />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-black text-gray-900 mb-2">{tool.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mb-4">
               {tool.official_url && (
                <a href={tool.official_url} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-4 py-2 rounded-full font-bold shadow-md hover:bg-gray-800 transition-transform transform hover:scale-105 flex items-center gap-2 text-xs whitespace-nowrap">公式サイト ↗</a>
              )}
               <div className="text-xs font-bold text-gray-400 flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                 <span>👀 {tool.view_count || 0} views</span>
               </div>
            </div>
            <p className="text-lg text-gray-700 font-medium mb-4">{tool.tagline}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link href={tool.user_id ? `/user/${tool.user_id}` : '#'} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors group">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-[10px] text-gray-600 font-bold group-hover:bg-black group-hover:text-white transition-colors border border-gray-200 overflow-hidden">
                  {publisher?.avatar_url ? <img src={publisher.avatar_url} className="w-full h-full object-cover" /> : <span>{publisher?.username ? publisher.username.slice(0, 1) : '👤'}</span>}
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-black">{publisher?.username || 'Unknown Developer'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ギャラリー */}
        {tool.screenshots && tool.screenshots.length > 0 && (
          <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
             <div className="flex gap-4">
               {tool.screenshots.map((shot, idx) => (
                 <div key={idx} className="bg-black overflow-hidden aspect-video rounded-2xl min-w-[300px]">
                     <SmartMedia src={shot} alt={`Screenshot ${idx}`} autoPlay={false} controls={true} />
                 </div>
               ))}
             </div>
          </div>
        )}

        <h2 className="text-xl font-black text-gray-900 mb-4">プランを選択して比較・保存</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {displayPlans.map((plan: any) => (
            <div key={plan.id} onClick={() => setActivePlan(plan)} className={`cursor-pointer border-2 rounded-xl p-5 transition-all relative overflow-hidden ${activePlan?.id === plan.id ? 'border-orange-500 bg-orange-50/30 ring-2 ring-orange-100' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              {activePlan?.id === plan.id && <span className="absolute top-0 center bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-b-md left-1/2 transform -translate-x-1/2">選択中</span>}
              <h3 className="font-bold text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-2xl font-black text-gray-900 mb-1">¥{plan.price.toLocaleString()}<span className="text-xs font-bold text-gray-400 ml-1">{plan.uiTypeLabel}</span></p>
              <div className="text-xs text-gray-500 font-bold mt-2">{plan.user_count > 1 && <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded mr-2">{plan.user_count}名まで</span>}{plan.desc}</div>
            </div>
          ))}
        </div>

        {activePlan && <CostSimulator saasPrice={saasPrice} currentPlan={activePlan as any} months={months} setMonths={setMonths} users={users} setUsers={setUsers} />}

        <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-10">
          <h2 className="text-xl font-black text-gray-900 mb-4">このツールについて</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-8">{tool.description || '詳細な説明はまだありません。'}</p>
          {(tool as any).specs && Object.keys((tool as any).specs).length > 0 && (
             <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
               <h3 className="text-sm font-bold text-gray-500 mb-2">スペック・仕様</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                  {Object.entries((tool as any).specs).map(([key, val]) => (
                     <div key={key} className="flex justify-between border-b border-gray-200 py-1">
                        <span className="text-sm font-bold text-gray-400">{key}</span>
                        <span className="text-sm font-bold text-gray-800">{String(val)}</span>
                     </div>
                  ))}
               </div>
             </div>
          )}
        </div>

        {/* レビュー & 評価エリア */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-black text-gray-900">評価とレビュー</h2>
            <button 
              onClick={openNewReviewModal}
              className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors mt-2 md:mt-0"
            >
              ✍️ レビューを書く
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8 mb-8">
             {/* 総合評価 */}
             <div className="flex flex-col items-center justify-center min-w-[120px]">
                <span className="text-6xl font-black text-gray-900">{tool.rating ? tool.rating.toFixed(1) : '0.0'}</span>
                <div className="text-yellow-400 text-xl my-1">
                   {'★'.repeat(Math.round(tool.rating || 0))}
                   <span className="text-gray-200">{'★'.repeat(5 - Math.round(tool.rating || 0))}</span>
                </div>
                <p className="text-xs font-bold text-gray-400">{reviews.length}件のコメント</p>
             </div>
             {/* 棒グラフ */}
             <div className="flex-1 w-full space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                   // 親レビューの総数で計算する
                   const totalRatings = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
                   const count = ratingDistribution[star] || 0;
                   const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                   return (
                      <div key={star} className="flex items-center gap-3">
                         <span className="text-xs font-bold text-gray-500 w-3">{star}</span>
                         <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-900 rounded-full" style={{ width: `${percentage}%` }}></div>
                         </div>
                         <span className="text-xs font-bold text-gray-400 w-6 text-right">{count}</span>
                      </div>
                   );
                })}
             </div>
          </div>

          {/* レビューリスト (スレッド表示) */}
          <div className="space-y-6">
             {reviews.length === 0 ? (
               <p className="text-center text-gray-400 py-4 font-bold">まだレビューはありません。最初の投稿者になりませんか？</p>
             ) : (
               reviews.map((review) => (
                  <div key={review.id} className="border-t border-gray-100 pt-6">
                     {/* 親コメント */}
                     <div className="mb-2">
                         <div className="flex items-center justify-between mb-2">
                            {/* プロフィールリンク */}
                            <Link href={`/user/${review.user_id}`} className="flex items-center gap-2 group">
                               <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                                 {review.profiles?.avatar_url ? (
                                   <img src={review.profiles.avatar_url} className="w-full h-full object-cover" />
                                 ) : (
                                   <span className="text-xs font-bold text-gray-400">{review.profiles?.username?.slice(0,1) || '?'}</span>
                                 )}
                               </div>
                               <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{review.profiles?.username || '名無しさん'}</span>
                            </Link>
                            <span className="text-xs font-bold text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                         </div>
                         {review.score && (
                            <div className="flex items-center gap-2 mb-2">
                               <div className="text-yellow-400 text-sm">{'★'.repeat(review.score)}<span className="text-gray-200">{'★'.repeat(5 - review.score)}</span></div>
                            </div>
                         )}
                         <p className="text-sm text-gray-700 leading-relaxed font-medium">{review.comment}</p>
                         <button 
                           onClick={() => handleReplyClick(review)}
                           className="text-xs font-bold text-gray-400 hover:text-black mt-2 flex items-center gap-1"
                         >
                           💬 返信する
                         </button>
                         {currentUserId === review.user_id && (
                             <button 
                               onClick={() => handleDeleteReview(review.id)} 
                               className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-1"
                             >
                               🗑️ 削除
                             </button>
                           )}
                     </div>

                     {/* 子コメント (返信) */}
                     {review.replies && review.replies.length > 0 && (
                        <div className="mt-2">
                           {/* ▼▼▼ 開閉ボタン ▼▼▼ */}
                           <button 
                             onClick={() => setExpandedReviews(prev => ({ ...prev, [review.id]: !prev[review.id] }))}
                             className="text-blue-600 font-bold text-sm flex items-center gap-2 hover:bg-blue-50 px-3 py-2 rounded-full transition-colors ml-2"
                           >
                             {expandedReviews[review.id] ? '▲ 返信を隠す' : `▼ ${review.replies.length}件の返信を表示`}
                           </button>

                           {/* ▼▼▼ 展開されるリスト ▼▼▼ */}
                           {expandedReviews[review.id] && (
                              <div className="ml-4 mt-2 pl-4 border-l-2 border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                 {review.replies.map(reply => (
                                    <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                                       <div className="flex items-center justify-between mb-1">
                                          <Link href={`/user/${reply.user_id}`} className="flex items-center gap-2 group">
                                             <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                                                {reply.profiles?.avatar_url ? (
                                                  <img src={reply.profiles.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                  <span className="text-[10px] font-bold text-gray-400">{reply.profiles?.username?.slice(0,1) || '?'}</span>
                                                )}
                                             </div>
                                             <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{reply.profiles?.username || '名無しさん'}</span>
                                          </Link>
                                          
                                          <div className="flex items-center gap-2">
                                             <span className="text-[10px] font-bold text-gray-400">{new Date(reply.created_at).toLocaleDateString()}</span>

                                             <button 
                                         onClick={() => handleReplyClick(review)}
                                         className="text-[10px] font-bold text-gray-400 hover:text-blue-600 flex items-center gap-1"
                                         title="返信する"
                                       >
                                         ↩️
                                       </button>
                                             {currentUserId === reply.user_id && (
                                               <button 
                                                 onClick={() => handleDeleteReview(reply.id)} 
                                                 className="text-[10px] font-bold text-red-400 hover:text-red-600 px-1"
                                                 title="削除"
                                               >
                                                 🗑️
                                               </button>
                                             )}
                                          </div>
                                       </div>
                                       <p className="text-xs text-gray-700 leading-relaxed font-medium">{reply.comment}</p>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               ))
             )}
          </div>
        </div>

      </div>
      <StockBar />

      {/* レビュー/返信 投稿モーダル */}
      {showReviewModal && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
               <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>
               <h3 className="text-xl font-black text-center mb-6">
                 {replyTarget ? `返信を書く` : `レビューを書く`}
               </h3>
               
               {/* 返信先表示 */}
               {replyTarget && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4 text-xs text-gray-500 border-l-4 border-gray-300">
                    <span className="font-bold block mb-1">@{replyTarget.profiles?.username || '名無し'} への返信:</span>
                    {replyTarget.comment.slice(0, 50)}...
                  </div>
               )}
               
               {/* 新規レビュー時のみ星選択を表示 */}
               {!replyTarget && (
                 <div className="mb-6 text-center">
                    <p className="text-xs font-bold text-gray-400 mb-2">評価を選択</p>
                    <div className="flex justify-center gap-2">
                       {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setInputScore(s)} className={`text-3xl transition-transform hover:scale-110 ${inputScore >= s ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
                       ))}
                    </div>
                 </div>
               )}

               <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 mb-2">コメント</label>
                  <textarea 
                    value={inputComment}
                    onChange={(e) => setInputComment(e.target.value)}
                   className="w-full p-3 border border-gray-200 rounded-xl font-black text-black text-sm h-32 outline-none focus:ring-2 focus:ring-black resize-none placeholder-gray-400"
                    placeholder={replyTarget ? "返信コメントを入力..." : "ツールの良かった点、気になった点などを教えてください..."}
                  />
               </div>

               <button 
                 disabled={isSubmitting}
                 onClick={handleSubmitReview}
                 className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
               >
                 {isSubmitting ? '送信中...' : (replyTarget ? '返信する' : 'レビューを投稿する')}
               </button>
            </div>
         </div>
      )}
    </main>
  );
}