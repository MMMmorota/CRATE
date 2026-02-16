"use client";

import { useMemo, useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot
} from 'recharts';

type Plan = {
  name: string;
  price: number;
  type: string;
  cycle_months?: number; // ★追加: 更新サイクル(月数)
  user_count?: number;   // ★追加: n人分
};

type Props = {
  saasPrice: number;
  currentPlan: Plan;
  months: number;
  setMonths: (months: number) => void;
  users: number;
  setUsers: (users: number) => void;
};

export default function CostSimulator({ saasPrice, currentPlan, months, setMonths, users, setUsers }: Props) {
  
  const [benchmarkPrice, setBenchmarkPrice] = useState(saasPrice);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [inflationRate, setInflationRate] = useState(0);
  const [updateCycle, setUpdateCycle] = useState(0);

  useEffect(() => {
    setBenchmarkPrice(saasPrice);
  }, [saasPrice]);

  const { chartData, breakEvenMonth, saasTotal, toolTotal } = useMemo(() => {
    const data = [];
    let sTotal = 0;
    let tTotal = 0;
    
    // ツールのコスト計算
    // 1契約で何人までカバーできるかを考慮 (例: 10,000円で5人までOKなら、6人目は2契約必要)
    const planUserCount = currentPlan.user_count || 1;
    const requiredContracts = Math.ceil(users / planUserCount);
    const periodicToolCost = currentPlan.price * requiredContracts;
    
    // SaaS(比較対象)のコスト計算 (常に1人あたり月額)
    let currentSaasMonthly = benchmarkPrice * users;

    // 更新サイクルの決定 (データがない場合はタイプから推測)
    let cycleMonths = currentPlan.cycle_months;
    if (!cycleMonths) {
       if (currentPlan.type === 'Yearly') cycleMonths = 12;
       else if (currentPlan.type === 'Monthly') cycleMonths = 1;
       else cycleMonths = 0; // 買い切り
    }

    let foundBreakEven: number | null = null;

    for (let m = 0; m <= months + 6; m++) {
      
      // 1. SaaS (比較対象) の加算
      if (m > 0) {
        if (m % 12 === 0) {
           currentSaasMonthly = currentSaasMonthly * (1 + inflationRate / 100);
        }
        sTotal += currentSaasMonthly;
      }

      // 2. ツール (選択中) の加算
      if (m === 0) {
        // 初回支払い
        tTotal = periodicToolCost;
      } else {
        if (cycleMonths && cycleMonths > 0) {
          // サブスクリプション (月額・年額など)
          if (m % cycleMonths === 0) {
            tTotal += periodicToolCost;
          }
        } else if (currentPlan.type === 'One-time') {
          // 買い切りの有料アップデート
          if (updateCycle > 0 && m % (updateCycle * 12) === 0) {
            tTotal += periodicToolCost;
          }
        }
      }

      // 分岐点判定 (SaaSの方が高くなった瞬間)
      if (foundBreakEven === null && m > 0 && tTotal < sTotal) {
        foundBreakEven = m;
      }

      // グラフ用データは指定期間まで
      if (m <= months) {
        data.push({
          month: m,
          SaaS: sTotal,
          Buy: tTotal,
        });
      }
    }

    const finalData = data[months];
    
    return {
      chartData: data,
      breakEvenMonth: foundBreakEven,
      saasTotal: finalData ? finalData.SaaS : 0,
      toolTotal: finalData ? finalData.Buy : 0,
    };
  }, [months, users, benchmarkPrice, currentPlan, inflationRate, updateCycle]);

  const diff = toolTotal - saasTotal;
  const isCheaper = diff < 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-12 shadow-lg ring-1 ring-black/5">
      
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            📊 リアルシミュレーション
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            あなたの「今のコスト」と比較してみましょう
          </p>
        </div>
        
        {/* 結果バッジ */}
        <div className={`px-4 py-2 rounded-lg border-l-4 ${breakEvenMonth ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
          <p className="text-xs text-gray-500 font-bold mb-1">損益分岐点</p>
          {breakEvenMonth ? (
            <p className="text-lg font-black text-green-700">
              {breakEvenMonth}ヶ月目<span className="text-sm font-normal text-gray-600"> で黒字化</span>
            </p>
          ) : (
             <p className="text-sm font-bold text-gray-400">期間内では回収不能</p>
          )}
        </div>
      </div>

      {/* 条件設定エリア */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        
        {/* 1. 利用人数 */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-bold text-sm text-gray-700">利用人数</label>
            <span className="font-bold text-blue-600">{users}名</span>
          </div>
          <input 
            type="range" min="1" max="50" step="1"
            value={users} onChange={(e) => setUsers(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* 2. 運用期間 */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-bold text-sm text-gray-700">想定運用期間</label>
            <span className="font-bold text-gray-900">{months}ヶ月 ({Math.floor(months/12)}年)</span>
          </div>
          <input 
            type="range" min="6" max="60" step="6"
            value={months} onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
          />
        </div>

        {/* 3. 比較対象の価格設定 */}
        <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
          <div className="flex justify-between mb-2">
            <label className="font-bold text-sm text-gray-700 flex items-center gap-2">
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">比較対象</span>
              現在の月額コスト (1人あたり)
            </label>
            <div className="flex items-center gap-2">
               <input 
                 type="number" 
                 value={benchmarkPrice}
                 onChange={(e) => setBenchmarkPrice(Number(e.target.value))}
                 className="w-24 text-right font-bold border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-red-500 outline-none"
               />
               <span className="text-sm font-bold text-gray-500">円</span>
            </div>
          </div>
          <input 
            type="range" min="0" max="10000" step="100"
            value={benchmarkPrice} onChange={(e) => setBenchmarkPrice(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>
      </div>

      {/* 詳細設定 */}
      <div className="mb-6">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1 mb-2"
        >
          {showAdvanced ? '▼ 詳細設定を閉じる' : '▶ 値上げリスクなどを考慮する'}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-orange-100 bg-orange-50/50 rounded-xl animate-fade-in">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-bold text-xs text-gray-700">SaaSの値上げ率 (年)</label>
                <span className="font-bold text-red-600 text-xs">{inflationRate}% /年</span>
              </div>
              <input 
                type="range" min="0" max="20" step="1"
                value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-bold text-xs text-gray-700">買い切り版の買い替え</label>
                <span className="font-bold text-blue-600 text-xs">
                  {updateCycle === 0 ? 'なし' : `${updateCycle}年ごと`}
                </span>
              </div>
              <input 
                type="range" min="0" max="5" step="1"
                value={updateCycle} onChange={(e) => setUpdateCycle(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* グラフエリア */}
      <div className="h-64 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="month" stroke="#999" fontSize={10} tickFormatter={(val: any) => `${val}ヶ月`} />
            <YAxis stroke="#999" fontSize={10} tickFormatter={(val: any) => `¥${val / 10000}万`} />
            <Tooltip 
              formatter={(value: any) => `¥${Number(value).toLocaleString()}`}
              labelFormatter={(label) => `${label}ヶ月目`}
              contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="SaaS" 
              stroke="#ef4444" 
              strokeWidth={2} 
              dot={false}
              name="比較対象 (SaaS)"
            />
            <Line 
              type="stepAfter"
              dataKey="Buy" 
              stroke="#2563eb" 
              strokeWidth={3} 
              dot={false}
              name={currentPlan.name}
            />
            {breakEvenMonth !== null && chartData[breakEvenMonth] && (
            <ReferenceDot 
              x={breakEvenMonth} 
              y={chartData[breakEvenMonth].Buy} 
              r={6} 
              fill="#f97316" 
              stroke="white" 
              strokeWidth={2} 
            />
          )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 結果サマリー */}
      <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          <p>比較対象 総額: ¥{Math.round(saasTotal).toLocaleString()}</p>
          <p>{currentPlan.name} 総額: ¥{toolTotal.toLocaleString()}</p>
        </div>
        <div className={`text-right ${isCheaper ? 'text-orange-600' : 'text-gray-400'}`}>
           <span className="text-xs font-bold block">トータル差額</span>
           <span className="text-2xl font-black tracking-tight">
             {diff > 0 ? '+' : ''}¥{Math.round(diff).toLocaleString()}
           </span>
        </div>
      </div>
    </div>
  );
}