"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

type PlanData = {
  name: string;
  price: string;
  type: 'one_time' | 'subscription' | 'oss';
  cycle_duration: string;
  cycle_unit: 'month' | 'year';
  user_count: string;
};

type SpecItem = {
  label: string;
  value: string;
};

const SPEC_TEMPLATES = [
  { category: '🟢 基本', items: ['対応OS', '対応言語', '無料トライアル', '商用利用', 'オフライン動作'] },
  { category: '💾 データ', items: ['データ保存先', 'エクスポート形式', 'インポート形式', 'API連携'] },
  { category: '🛡️ 安心', items: ['サポート体制', '返金保証', '更新頻度'] },
];

export default function SubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // ★アップロード中フラグ
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("サービスの掲載にはログインが必要です 🙇‍♂️");
        router.push('/login');
      }
    };
    checkUser();
  }, [router]);

  // --- フォームの状態管理 ---
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isOffline, setIsOffline] = useState(true);
  const [screenshots, setScreenshots] = useState<string[]>(['']);
  
  const [plans, setPlans] = useState<PlanData[]>([
    { name: 'Standard License', price: '', type: 'one_time', cycle_duration: '', cycle_unit: 'month', user_count: '' }
  ]);

  const [specs, setSpecs] = useState<SpecItem[]>([
    { label: '対応OS', value: '' },
    { label: '日本語対応', value: 'あり' },
  ]);

  const [officialUrl, setOfficialUrl] = useState('');

  // --- ★追加: Storageへアップロードする関数 ---
  const uploadToStorage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      // ファイル名の衝突を防ぐためにランダムな名前を生成
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 'tools' バケットにアップロード
      const { error: uploadError } = await supabase.storage
        .from('tools')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 公開URLを取得
      const { data } = supabase.storage.from('tools').getPublicUrl(filePath);
      setUploading(false);
      return data.publicUrl;
    } catch (error: any) {
      console.error(error);
      alert('アップロードに失敗しました: ' + error.message);
      setUploading(false);
      return null;
    }
  };

  // --- ハンドラー関数 ---
  
  // ★修正: ファイル選択時にStorageへアップロードするように変更
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) { 
      alert("ファイルサイズは50MB以下にしてください。\n（またはYouTubeなどにアップしてURLを入力してください）");
      return;
    }

    // StorageへアップロードしてURLを取得
    const publicUrl = await uploadToStorage(file);
    if (publicUrl) {
      setter(publicUrl);
    }
  };

  const updateScreenshot = (index: number, value: string) => {
    const newList = [...screenshots];
    newList[index] = value;
    setScreenshots(newList);
  };
  const addScreenshot = () => setScreenshots([...screenshots, '']);
  const removeScreenshot = (index: number) => setScreenshots(screenshots.filter((_, i) => i !== index));

  const updatePlan = (index: number, field: keyof PlanData, value: any) => {
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setPlans(newPlans);
  };
  const addPlan = () => setPlans([...plans, { name: 'New Plan', price: '', type: 'one_time', cycle_duration: '', cycle_unit: 'month', user_count: '' }]);
  const removePlan = (index: number) => setPlans(plans.filter((_, i) => i !== index));

  const updateSpec = (index: number, field: keyof SpecItem, value: string) => {
    const newSpecs = [...specs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setSpecs(newSpecs);
  };
  const addSpec = () => setSpecs([...specs, { label: '', value: '' }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

  const addSpecFromTemplate = (label: string) => {
    if (specs.some(s => s.label === label)) return;
    const emptyIndex = specs.findIndex(s => s.label === '' && s.value === '');
    if (emptyIndex !== -1) {
      updateSpec(emptyIndex, 'label', label);
    } else {
      setSpecs([...specs, { label, value: '' }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) {
      alert("アップロード中です。完了するまでお待ちください⏳");
      return;
    }
    setLoading(true);

    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t !== '');
    const validScreenshots = screenshots.filter(s => s.trim() !== '');
    
    const formattedPlans = plans.map(p => ({
      ...p,
      price: Number(p.price) || 0,
      cycle_duration: Number(p.cycle_duration) || 1,
      user_count: Number(p.user_count) || 1
    }));
    const mainPlan = formattedPlans[0];

    const specsJson = specs.reduce((acc, item) => {
      if (item.label.trim() && item.value.trim()) {
        acc[item.label.trim()] = item.value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('tools')
      .insert([
        {
          user_id: user?.id,
          name,
          tagline,
          price: mainPlan.price,
          price_model: mainPlan.type,
          image_url: iconUrl || '📦',
          description,
          is_offline: isOffline,
          tags: tagArray,
          view_count: 0,
          rating: 0,
          screenshots: validScreenshots,
          plans: formattedPlans,
          specs: specsJson,
          official_url: officialUrl,
        }
      ]);

    if (error) {
      alert('エラー: ' + error.message);
      setLoading(false);
    } else {
      alert('ツールを掲載しました！🎉');
      router.push('/');
    }
  };

  const isVideo = (src: string) => src.startsWith('data:video') || src.match(/\.(mp4|webm|mov)$/i) !== null || (src.includes('supabase') && !src.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none font-bold text-black placeholder-gray-400 bg-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none appearance-none";
  const labelClass = "block text-sm font-black text-black mb-2";

  return (
    <main className="min-h-screen bg-gray-50 pt-12 pb-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm font-bold text-gray-600 hover:text-black">← ホームに戻る</Link>
          <h1 className="mt-4 text-3xl font-black text-black">あなたのツールを掲載しよう</h1>
        </div>

        <div className="bg-white py-8 px-8 shadow-xl rounded-2xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* 1. 基本情報 */}
            <section>
              <h2 className="text-xl font-black text-black mb-6 flex items-center gap-2">
                <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                基本情報
              </h2>
              <div className="space-y-6 pl-2 md:pl-4">
                <div>
                  <label className={labelClass}>ツール名</label>
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="例: SuperNote" />
                </div>
                <div>
                  <label className={labelClass}>アイコン画像 / 動画</label>
                  <div className="flex gap-4 items-start">
                     <div className="flex-1">
                        <label className="block w-full cursor-pointer mb-2">
                          {/* ▼▼▼ 修正: ここに video/* を追加しました ▼▼▼ */}
                          <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, setIconUrl)} className="hidden" />
                          <div className={`w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-center transition-colors ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                            <span className="text-sm font-bold text-black">{uploading ? 'アップロード中...' : '📁 タップしてアイコン/動画をアップロード'}</span>
                          </div>
                        </label>
                        <input type="text" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} className={`${inputClass} text-xs`} placeholder="またはURLを直接入力..." />
                     </div>
                     <div className="w-20 h-20 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {/* ▼▼▼ 修正: 動画なら動くようにプレビューを分岐 ▼▼▼ */}
                        {iconUrl ? (
                          isVideo(iconUrl) ? (
                            <video src={iconUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                          ) : (
                            <img src={iconUrl} className="w-full h-full object-cover" alt="icon" />
                          )
                        ) : (
                          <span className="text-xs text-gray-500 font-bold">Preview</span>
                        )}
                        {/* ▲▲▲ 修正ここまで ▲▲▲ */}
                     </div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>キャッチコピー</label>
                  <input required type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} placeholder="例: 思考を整理する、最速のメモアプリ。" />
                </div>

                <div>
                  <label className={labelClass}>公式サイトのURL (購入・DLページ)</label>
                  <input 
                    type="url" 
                    value={officialUrl} 
                    onChange={(e) => setOfficialUrl(e.target.value)} 
                    className={inputClass} 
                    placeholder="https://example.com/pricing" 
                  />
                  <p className="text-xs text-gray-500 mt-1 font-bold">※ 詳細ページからこのURLへ誘導します</p>
                </div>
                
                {/* ギャラリー部分は変更なし（そのまま残してください） */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className={labelClass}>📸 ギャラリー (画像・動画)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {screenshots.map((shot, idx) => (
                      <div key={idx} className="relative group">
                         {/* ▼▼▼ 修正: 背景をグレー、画像をcontain(全体表示)に変更 ▼▼▼ */}
                         <div className="aspect-video bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center relative shadow-sm">
                            {shot ? (
                              isVideo(shot) ? (
                                <video src={shot} className="w-full h-full object-contain" controls muted playsInline /> 
                              ) : (
                                (shot.startsWith('data:') || shot.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null) ? (
                                  <img src={shot} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="text-gray-500 text-xs font-bold p-2 text-center break-all">🔗 {shot}</div>
                                )
                              )
                            ) : <span className="text-gray-400 text-xs font-bold">No Media</span>}
                            {screenshots.length > 1 && <button type="button" onClick={() => removeScreenshot(idx)} className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs font-bold shadow-md hover:scale-110 transition-transform z-10">×</button>}
                         </div>
                         {/* ▲▲▲ 修正ここまで ▲▲▲ */}
                         
                         <input 
                           type="text" 
                           value={shot} 
                           onChange={(e) => updateScreenshot(idx, e.target.value)} 
                           className={`${inputClass} text-xs mt-2`} 
                           placeholder="画像のURL または 動画リンク" 
                         />
                         
                         <label className={`cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center mt-2 gap-1 bg-white border border-blue-200 rounded py-2 hover:bg-blue-50 transition-colors ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                            <span>{uploading ? '⏳ 処理中...' : '📁 ファイルを選択 (画像/動画)'}</span>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              className="hidden"
                              disabled={uploading}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const publicUrl = await uploadToStorage(file);
                                  if (publicUrl) {
                                     updateScreenshot(idx, publicUrl);
                                  }
                                }
                              }}
                            />
                         </label>
                      </div>
                    ))}
                    <button type="button" onClick={addScreenshot} className="aspect-video border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-white hover:border-black hover:text-black transition-colors">
                      <span className="text-2xl font-bold">+</span>
                      <span className="text-xs font-bold">追加する</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* 2. 価格プラン (変更なし) */}
            <section>
              <h2 className="text-xl font-black text-black mb-6 flex items-center gap-2">
                <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                価格プラン
              </h2>
              <div className="pl-2 md:pl-4 space-y-6">
                {plans.map((plan, idx) => (
                  <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative">
                     {plans.length > 1 && (
                       <button type="button" onClick={() => removePlan(idx)} className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-sm font-bold">削除 ×</button>
                     )}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input type="text" value={plan.name} onChange={(e) => updatePlan(idx, 'name', e.target.value)} className={inputClass} placeholder="プラン名" />
                        <select value={plan.type} onChange={(e) => updatePlan(idx, 'type', e.target.value)} className={inputClass}>
                              <option value="one_time">💰 買い切り</option>
                              <option value="subscription">🔄 サブスク</option>
                              <option value="oss">🎁 無料 / OSS</option>
                        </select>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="number" value={plan.price} onChange={(e) => updatePlan(idx, 'price', e.target.value)} className={inputClass} placeholder="価格" />
                        <div className="flex items-center">
                             <input type="number" min="1" value={plan.user_count} onChange={(e) => updatePlan(idx, 'user_count', e.target.value)} className={`${inputClass} text-center`} placeholder="1" />
                             <span className="ml-2 text-sm font-bold text-black whitespace-nowrap">人分</span>
                        </div>
                        {plan.type === 'subscription' && (
                          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
                               <input type="number" min="1" value={plan.cycle_duration} onChange={(e) => updatePlan(idx, 'cycle_duration', e.target.value)} className="w-12 p-2 text-center font-bold text-black outline-none border-r border-gray-200 [&::-webkit-inner-spin-button]:appearance-none" />
                               <select value={plan.cycle_unit} onChange={(e) => updatePlan(idx, 'cycle_unit', e.target.value)} className="flex-1 p-2 font-bold text-black outline-none bg-transparent">
                                  <option value="month">ヶ月</option>
                                  <option value="year">年</option>
                               </select>
                               <span className="text-xs font-bold text-black pr-2">ごと</span>
                          </div>
                        )}
                     </div>
                  </div>
                ))}
                <button type="button" onClick={addPlan} className="w-full py-3 border-2 border-dashed border-gray-400 rounded-xl font-bold text-gray-600 hover:bg-white hover:border-black hover:text-black transition-all">＋ プランを追加</button>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* 3. 詳細情報 & スペック (変更なし) */}
            <section>
              <h2 className="text-xl font-black text-black mb-6 flex items-center gap-2">
                <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                詳細・スペック
              </h2>
              <div className="space-y-6 pl-2 md:pl-4">
                
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <div className="mb-4">
                    <p className="text-xs font-bold text-blue-800 mb-2">⚡ よく使う項目を追加 (クリック)</p>
                    <div className="flex flex-wrap gap-2">
                      {SPEC_TEMPLATES.map(group => (
                         group.items.map(item => (
                            <button 
                              key={item} 
                              type="button" 
                              onClick={() => addSpecFromTemplate(item)}
                              className="px-2 py-1 text-[10px] bg-white border border-blue-200 text-blue-600 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors font-bold shadow-sm"
                            >
                              ＋ {item}
                            </button>
                         ))
                      ))}
                    </div>
                  </div>

                  <label className="block text-sm font-black text-blue-900 mb-2">🆚 比較表に載せるスペック</label>
                  <div className="space-y-3">
                    {specs.map((spec, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          value={spec.label} 
                          onChange={(e) => updateSpec(idx, 'label', e.target.value)} 
                          className="w-1/3 p-3 border border-gray-300 rounded-lg font-bold text-black text-sm"
                          placeholder="項目名"
                        />
                        <input 
                          type="text" 
                          value={spec.value} 
                          onChange={(e) => updateSpec(idx, 'value', e.target.value)} 
                          className="flex-1 p-3 border border-gray-300 rounded-lg font-bold text-black text-sm"
                          placeholder="内容 (例: Win, Mac)"
                        />
                        {specs.length > 1 && (
                          <button type="button" onClick={() => removeSpec(idx)} className="text-gray-400 hover:text-red-500 font-bold px-2">×</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addSpec} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-2">
                      ＋ 空の項目を追加する
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>説明文</label>
                  <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="ツールの特徴、メリット、使い方などを詳しく書いてください..." />
                </div>
                <div>
                  <label className={labelClass}>タグ (カンマ区切り)</label>
                  <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="Mac, エディタ, 効率化, デザイン" />
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer bg-white">
                  <input id="offline" type="checkbox" checked={isOffline} onChange={(e) => setIsOffline(e.target.checked)} className="w-5 h-5 accent-black cursor-pointer" />
                  <label htmlFor="offline" className="text-sm font-bold text-black cursor-pointer select-none">オフライン動作 (インターネットなしで使える)</label>
                </div>
              </div>
            </section>

            <div className="pt-4">
              <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all transform hover:scale-[1.01] ${loading ? 'bg-gray-400' : 'bg-black hover:bg-gray-900'}`}>
                {loading ? '送信中...' : 'このツールを掲載する 🚀'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}