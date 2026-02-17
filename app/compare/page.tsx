"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useStock } from '../../context/StockContext';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar'; // Navbarも追加しておきます
import StockBar from '../../components/StockBar'; // StockBarも追加
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// グラフの色パレット
const COLORS = ['#2563eb', '#ea580c', '#16a34a', '#db2777', '#9333ea', '#0891b2'];

// 個別の設定を管理する型
type CustomSetting = {
  price: number;
  type: 'monthly' | 'yearly' | 'onetime';
  updateCycle: number;
};

// プラン定義
type Plan = {
  id: string;
  name: string;
  price: number;
  type: 'monthly' | 'yearly' | 'onetime';
};

// ツール詳細データの型
type ToolDetailData = {
  id: string;
  name: string;
  is_offline: boolean;
  developer: string;
  rating: number;
  description: string;
  specs: { [key: string]: string };
};
// 動画判定用の関数
const isVideo = (src?: string) => {
  if (!src) return false;
  return src.startsWith('data:video') || src.match(/\.(mp4|webm|mov)$/i) !== null;
};


export default function ComparePage() {
  const { items } = useStock();
  
  // 1. 全体設定
  const [months, setMonths] = useState(36);
  const [users, setUsers] = useState(5);
  
  // 2. 個別設定
  const [customSettings, setCustomSettings] = useState<{ [key: string]: CustomSetting }>({});

  // 3. 詳細データ
  const [toolDetails, setToolDetails] = useState<ToolDetailData[]>([]);

  // パネル開閉
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // DBからツールの詳細情報を取得
  useEffect(() => {
    const fetchDetails = async () => {
      if (items.length === 0) return;
      
      const { data, error } = await supabase
        .from('tools')
        // ★修正: specs を取得
        .select('id, name, is_offline, rating, description, specs')
        .in('id', items.map(i => i.id));

      if (!error && data) {
        const formatted = data.map(d => {
            // ★修正: DBの specs があれば使い、なければ空にする (デモロジックを削除)
            return {
                ...d,
                developer: 'Unknown Dev',
                specs: d.specs || {} // JSONそのまま使う
            };
        });
        setToolDetails(formatted);
      }
    };
    fetchDetails();
  }, [items]);

  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    toolDetails.forEach(tool => {
        if (tool.specs) {
            Object.keys(tool.specs).forEach(k => keys.add(k));
        }
    });
    return Array.from(keys).sort();
  }, [toolDetails]);

  const getPlansForTool = (tool: { price: number; planName: string }): Plan[] => {
    const isSubscription = tool.planName.includes('年') || tool.planName.includes('Year');
    const basePrice = tool.price;

    if (isSubscription) {
        return [
            { id: 'p1', name: 'Standard Plan', price: basePrice, type: 'yearly' },
            { id: 'p2', name: 'Pro Plan', price: Math.floor(basePrice * 2.5), type: 'yearly' },
        ];
    } else {
        return [
            { id: 'p1', name: 'Personal License', price: basePrice, type: 'onetime' },
            { id: 'p2', name: 'Business License', price: Math.floor(basePrice * 2.5), type: 'onetime' },
            { id: 'p3', name: 'Maintenance (年額保守)', price: Math.floor(basePrice * 0.2), type: 'yearly' },
        ];
    }
  };

  const { chartData, ranking } = useMemo(() => {
    const data: any[] = [];
    const finalCosts: { [key: string]: number } = {};

    for (let m = 0; m <= months; m++) {
      const point: any = { month: m };

      items.forEach((item) => {
        const defaultType = (item.planName.includes('年')) ? 'yearly' : 'onetime';
        
        const setting = customSettings[item.id] || {
          price: item.price,
          type: defaultType,
          updateCycle: 0
        };

        let cost = 0;

        if (setting.type === 'monthly') {
          cost = setting.price * users * m;
        } else if (setting.type === 'yearly') {
          const years = m === 0 ? 0 : Math.ceil(m / 12);
          cost = setting.price * users * years;
        } else {
          const cycleMonths = setting.updateCycle * 12;
          let times = 1; 
          if (m === 0) {
            times = 0; 
          } else if (cycleMonths > 0) {
            times = Math.floor((m - 1) / cycleMonths) + 1;
          }
          cost = setting.price * users * times;
        }
        
        point[item.id] = cost;
        if (m === months) finalCosts[item.id] = cost;
      });

      data.push(point);
    }

    const sortedList = Object.keys(finalCosts).sort((a, b) => finalCosts[a] - finalCosts[b]);
    return { chartData: data, ranking: sortedList, finalCosts };
  }, [items, months, users, customSettings]);

  const updateSetting = (id: string, key: keyof CustomSetting, value: any) => {
    setCustomSettings(prev => {
      const current = prev[id] || {
        price: items.find(i => i.id === id)?.price || 0,
        type: (items.find(i => i.id === id)?.planName.includes('年') ? 'yearly' : 'onetime'),
        updateCycle: 0
      };
      return { ...prev, [id]: { ...current, [key]: value } };
    });
  };

  const applyPresetPlan = (itemId: string, plan: Plan) => {
    setCustomSettings(prev => ({
      ...prev,
      [itemId]: {
        price: plan.price,
        type: plan.type,
        updateCycle: 0
      }
    }));
  };

  const handleLegendClick = (e: any) => {
    const clickedId = e.dataKey;
    setExpandedId(prev => (prev === clickedId ? null : clickedId));
    if (clickedId !== expandedId) {
        setTimeout(() => {
            const element = document.getElementById(`panel-${clickedId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">比較リストは空っぽです 📦</h1>
        <Link href="/" className="bg-black text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
          ツールを探しに行く
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      <Navbar /> {/* ナビゲーションバーを表示 */}

      <div className="bg-white border-b border-gray-200 sticky top-16 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-gray-500 hover:text-black">← 戻る</Link>
            <h1 className="text-xl font-black text-gray-900">⚔️ 徹底比較シミュレーション</h1>
          </div>
          <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
            {items.length}件
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* 1. コスト比較グラフ */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8 h-[400px] relative">
           <div className="absolute top-4 right-6 bg-white/80 backdrop-blur px-3 py-1 rounded-lg border border-gray-100 z-10 text-xs text-gray-500 font-bold">
             利用人数: {users}名 × 期間: {months}ヶ月
           </div>
           
           <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="month" tickFormatter={(v: any) => `${v}ヶ月`} stroke="#ccc" fontSize={10} />
              <YAxis tickFormatter={(v: any) => `¥${v/10000}万`} stroke="#ccc" fontSize={10} />
              <Tooltip 
                formatter={(val: any) => `¥${Number(val).toLocaleString()}`} 
                labelFormatter={(l) => `${l}ヶ月目`}
                contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: 'none' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle" 
                onClick={handleLegendClick} 
                wrapperStyle={{ cursor: 'pointer', paddingBottom: '10px' }}
              />
              
              {items.map((item, index) => (
                  <Line 
                    key={item.id}
                    type="stepAfter"
                    dataKey={item.id}
                    name={item.name}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 2. 共通条件設定 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-12">
           <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">シミュレーション条件</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between mb-2">
                   <label className="text-sm font-bold text-gray-700">利用人数</label>
                   <span className="font-bold text-blue-600">{users}名</span>
                </div>
                <input type="range" min="1" max="50" value={users} onChange={(e) => setUsers(Number(e.target.value))} className="w-full accent-blue-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"/>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                   <label className="text-sm font-bold text-gray-700">比較期間</label>
                   <span className="font-bold text-gray-900">{months}ヶ月 ({Math.floor(months/12)}年)</span>
                </div>
                <input type="range" min="6" max="120" step="6" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full accent-black h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"/>
              </div>
           </div>
        </div>

        {/* 3. 詳細設定パネル（ランキング形式） */}
        <div className="mb-12">
           <h3 className="font-bold text-gray-900 mb-4 text-lg">👇 コスト詳細・プラン変更</h3>
           <div className="space-y-3">
             {ranking.map((key: string, index: number) => {
                const item = items.find(i => i.id === key);
                if (!item) return null;

                const isExpanded = expandedId === item.id;
                const isWinner = index === 0;
                const setting = customSettings[item.id] || { 
                   price: item.price, 
                   type: (item.planName.includes('年') ? 'yearly' : 'onetime') as any,
                   updateCycle: 0
                };
                const availablePlans = getPlansForTool(item);

                return (
                  <div id={`panel-${item.id}`} key={item.id} className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-2 ring-black border-transparent shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div onClick={() => setExpandedId(isExpanded ? null : item.id)} className="p-4 flex items-center justify-between cursor-pointer">
                       <div className="flex items-center gap-4">
                          <span className={`font-black w-6 text-center text-lg ${isWinner ? 'text-yellow-500' : 'text-gray-300'}`}>{index + 1}</span>
                          
                          {/* ★修正: 画像表示ロジック */}
                          <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center text-xl overflow-hidden border border-gray-100">
                             {isVideo(item.image) ? (
                        <video 
                          src={item.image} 
                          className="w-full h-full object-cover" 
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                        />
                      ) : (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      )}
                          </div>

                          <div>
                             <p className="font-bold text-gray-900">{item.name}</p>
                             <p className="text-xs text-gray-500 flex items-center gap-2">
                                {setting.type === 'onetime' ? 'One-time' : setting.type === 'yearly' ? 'Yearly' : 'Monthly'}
                                <span className="bg-gray-100 px-1 rounded text-[10px]">¥{setting.price.toLocaleString()}</span>
                                {customSettings[item.id] && <span className="text-blue-600 font-bold">● カスタム中</span>}
                             </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`font-black text-lg ${isWinner ? 'text-orange-600' : 'text-gray-900'}`}>
                             ¥{chartData[months][key]?.toLocaleString()}
                          </p>
                          <span className="text-xs text-gray-400">{isExpanded ? '▲ 閉じる' : '設定 ▼'}</span>
                       </div>
                    </div>
                    {isExpanded && (
                      <div className="bg-gray-50 p-4 border-t border-gray-100 animate-slide-down">
                         <div className="mb-4 pb-4 border-b border-gray-200">
                            <label className="text-xs font-bold text-gray-500 mb-2 block">📋 プラン選択</label>
                            <div className="flex flex-wrap gap-2">
                               {availablePlans.map((plan) => (
                                   <button key={plan.id} onClick={() => applyPresetPlan(item.id, plan)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${(setting.price === plan.price && setting.type === plan.type) ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                                       {plan.name} (¥{plan.price.toLocaleString()})
                                   </button>
                               ))}
                            </div>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-80">
                            <div>
                               <label className="text-[10px] font-bold text-gray-400 mb-1 block">プラン形態</label>
                               <select value={setting.type} onChange={(e) => updateSetting(item.id, 'type', e.target.value)} className="w-full p-2 rounded border border-gray-300 text-sm">
                                  <option value="onetime">買い切り</option>
                                  <option value="yearly">年額</option>
                                  <option value="monthly">月額</option>
                               </select>
                            </div>
                            <div>
                               <label className="text-[10px] font-bold text-gray-400 mb-1 block">単価 (¥)</label>
                               <input type="number" value={setting.price} onChange={(e) => updateSetting(item.id, 'price', Number(e.target.value))} className="w-full p-2 rounded border border-gray-300 text-sm"/>
                            </div>
                            <div className={setting.type === 'onetime' ? 'opacity-100' : 'opacity-30 pointer-events-none'}>
                               <label className="text-[10px] font-bold text-gray-400 mb-1 block">買い替え頻度</label>
                               <select value={setting.updateCycle} onChange={(e) => updateSetting(item.id, 'updateCycle', Number(e.target.value))} className="w-full p-2 rounded border border-gray-300 text-sm">
                                  <option value={0}>なし</option>
                                  <option value={1}>1年ごと</option>
                                  <option value={2}>2年ごと</option>
                               </select>
                            </div>
                         </div>
                      </div>
                    )}
                  </div>
                );
             })}
           </div>
        </div>

        {/* 4. 機能・スペック比較 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
           <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">🆚 機能・スペック比較</h3>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full min-w-[600px]">
               <thead>
                 <tr className="bg-white border-b border-gray-100">
                   <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase w-32">項目</th>
                   {items.map(item => (
                     <th key={item.id} className="py-4 px-6 text-center min-w-[150px]">
                        <div className="flex flex-col items-center gap-2">
                           {/* ★修正: ヘッダー画像表示ロジック */}
                           <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-lg overflow-hidden border border-gray-200">
                              {(item.image?.startsWith('http') || item.image?.startsWith('data:')) ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-lg">{item.image || '📦'}</span>
                              )}
                           </div>
                           <span className="text-sm font-bold text-gray-900">{item.name}</span>
                        </div>
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 <tr>
                    <td className="py-4 px-6 text-xs font-bold text-gray-500 bg-gray-50/50 sticky left-0">評価</td>
                    {items.map(item => {
                       const detail = toolDetails.find(d => d.id === item.id);
                       return <td key={item.id} className="py-4 px-6 text-center text-yellow-500 font-bold text-sm">{detail ? `★ ${detail.rating.toFixed(1)}` : '-'}</td>;
                    })}
                 </tr>
                 <tr>
                    <td className="py-4 px-6 text-xs font-bold text-gray-500 bg-gray-50/50 sticky left-0">オフライン</td>
                    {items.map(item => {
                       const detail = toolDetails.find(d => d.id === item.id);
                       return <td key={item.id} className="py-4 px-6 text-center text-lg">{detail ? (detail.is_offline ? '✅' : '❌') : '-'}</td>;
                    })}
                 </tr>

                 {allSpecKeys.map(key => (
                   <tr key={key}>
                     <td className="py-4 px-6 text-xs font-bold text-gray-500 bg-gray-50/50 sticky left-0 truncate max-w-[150px]" title={key}>{key}</td>
                     {items.map(item => {
                        const detail = toolDetails.find(d => d.id === item.id);
                        const val = detail?.specs?.[key];
                        return (
                           <td key={item.id} className="py-4 px-6 text-center text-xs text-gray-700">
                              {val || <span className="text-gray-300">-</span>}
                           </td>
                        );
                     })}
                   </tr>
                 ))}

                 <tr>
                    <td className="py-4 px-6 text-xs font-bold text-gray-500 bg-gray-50/50 sticky left-0">概要</td>
                    {items.map(item => {
                       const detail = toolDetails.find(d => d.id === item.id);
                       return <td key={item.id} className="py-4 px-6 text-center text-xs text-gray-500 leading-relaxed px-4 min-w-[200px]">{detail?.description?.slice(0, 50) || 'No description'}...</td>;
                    })}
                 </tr>
               </tbody>
             </table>
           </div>
        </div>
      </div>
      <StockBar /> {/* ストックバーも表示 */}
    </main>
  );
}