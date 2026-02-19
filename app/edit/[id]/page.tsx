"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import SmartMedia from '../../../components/SmartMedia'; // パスは階層に合わせて調整してください

type PlanData = {
  name: string;
  price: string; // 入力フォーム用なのでstring
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

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // --- フォームの状態 ---
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isOffline, setIsOffline] = useState(true);
  const [screenshots, setScreenshots] = useState<string[]>(['']);
  const [officialUrl, setOfficialUrl] = useState('');
  
  const [plans, setPlans] = useState<PlanData[]>([
    { name: 'Standard License', price: '', type: 'one_time', cycle_duration: '', cycle_unit: 'month', user_count: '' }
  ]);

  const [specs, setSpecs] = useState<SpecItem[]>([
    { label: '', value: '' },
  ]);

  // --- データの読み込み ---
  useEffect(() => {
    const fetchData = async () => {
      // ログインチェック
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("編集するにはログインが必要です");
        router.push('/login');
        return;
      }

      // ツール情報の取得
      const { data: tool, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !tool) {
        alert("ツールが見つかりませんでした");
        router.push('/mypage');
        return;
      }

      // 権限チェック (所有者 または 管理者)
      // ※ 管理者判定が必要な場合は別途 profiles テーブルを参照してください
      if (tool.user_id !== user.id) {
         // ここで厳密に弾くか、管理者なら通すロジックを入れる
         // 今回は簡易的に「本人以外は警告」とします（本来はサーバーサイドで弾くべき）
         const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
         if (!profile?.is_admin) {
            alert("編集権限がありません");
            router.push('/');
            return;
         }
      }

      // フォームへの反映
      setName(tool.name);
      setTagline(tool.tagline);
      setIconUrl(tool.image_url);
      setDescription(tool.description);
      setTags(tool.tags ? tool.tags.join(', ') : '');
      setIsOffline(tool.is_offline);
      setScreenshots(tool.screenshots && tool.screenshots.length > 0 ? tool.screenshots : ['']);
      setOfficialUrl(tool.official_url || '');

      // プラン情報の復元
      if (tool.plans && Array.isArray(tool.plans)) {
        const formattedPlans = tool.plans.map((p: any) => ({
          name: p.name || '',
          price: String(p.price || 0),
          type: p.type || 'one_time',
          cycle_duration: String(p.cycle_duration || 1),
          cycle_unit: p.cycle_unit || 'month',
          user_count: String(p.user_count || 1)
        }));
        setPlans(formattedPlans);
      }

      // スペック情報の復元 (JSON object -> Array)
      if (tool.specs) {
        const specArray = Object.entries(tool.specs).map(([key, val]) => ({
          label: key,
          value: String(val)
        }));
        setSpecs(specArray.length > 0 ? specArray : [{ label: '', value: '' }]);
      }

      setLoading(false);
    };

    if (id) fetchData();
  }, [id, router]);


  // --- Storageアップロード関数 ---
  const uploadToStorage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('tools').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('tools').getPublicUrl(filePath);
      setUploading(false);
      return data.publicUrl;
    } catch (error: any) {
      console.error(error);
      alert('アップロード失敗: ' + error.message);
      setUploading(false);
      return null;
    }
  };

  // --- ハンドラー ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { 
      alert("ファイルサイズは50MB以下にしてください");
      return;
    }
    const publicUrl = await uploadToStorage(file);
    if (publicUrl) setter(publicUrl);
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
    if (emptyIndex !== -1) updateSpec(emptyIndex, 'label', label);
    else setSpecs([...specs, { label, value: '' }]);
  };

  // --- 更新処理 (Update) ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) {
      alert("アップロード中です。完了するまでお待ちください⏳");
      return;
    }
    setSaving(true);

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

    // ★重要: updateクエリ
    const { error } = await supabase
      .from('tools')
      .update({
        name,
        tagline,
        price: mainPlan.price,
        price_model: mainPlan.type,
        image_url: iconUrl || '📦',
        description,
        is_offline: isOffline,
        tags: tagArray,
        screenshots: validScreenshots,
        plans: formattedPlans,
        specs: specsJson,
        official_url: officialUrl,
        updated_at: new Date(),
      })
      .eq('id', id);

    if (error) {
      alert('更新エラー: ' + error.message);
    } else {
      alert('ツール情報を更新しました！🎉');
      router.push('/mypage'); // マイページに戻る
    }
    setSaving(false);
  };

  const isVideo = (src: string) => src.startsWith('data:video') || src.match(/\.(mp4|webm|mov)$/i) !== null || (src.includes('supabase') && !src.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none font-bold text-black placeholder-gray-400 bg-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none appearance-none";
  const labelClass = "block text-sm font-black text-black mb-2";

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">データを読み込み中...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pt-12 pb-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/mypage" className="text-sm font-bold text-gray-600 hover:text-black">← マイページに戻る</Link>
          <h1 className="mt-4 text-3xl font-black text-black">掲載内容を編集</h1>
        </div>

        <div className="bg-white py-8 px-8 shadow-xl rounded-2xl border border-gray-100">
          <form onSubmit={handleUpdate} className="space-y-10">
            
            {/* 基本情報 */}
            <section>
              <h2 className="text-xl font-black text-black mb-6 border-b pb-2">基本情報</h2>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>ツール名</label>
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>アイコン画像 / 動画</label>
                  <div className="flex gap-4 items-start">
                     <div className="flex-1">
                        <label className={`block w-full cursor-pointer mb-2 ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                          <input type="file" accept="image/*,video/*" disabled={uploading} onChange={(e) => handleFileUpload(e, setIconUrl)} className="hidden" />
                          <div className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-center transition-colors">
                             <span className="text-sm font-bold text-black">{uploading ? 'アップロード中...' : '📁 変更する'}</span>
                          </div>
                        </label>
                        <input type="text" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} className={`${inputClass} text-xs`} />
                     </div>
                     <div className="w-20 h-20 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {iconUrl ? (isVideo(iconUrl) ? <video src={iconUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline /> : <img src={iconUrl} className="w-full h-full object-cover" />) : null}
                     </div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>キャッチコピー</label>
                  <input required type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>公式サイトURL</label>
                  <input type="url" value={officialUrl} onChange={(e) => setOfficialUrl(e.target.value)} className={inputClass} />
                </div>

                {/* ギャラリー */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className={labelClass}>📸 ギャラリー (画像・動画)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {screenshots.map((shot, idx) => (
                      <div key={idx} className="relative group">
                         <div className="aspect-video bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center relative shadow-sm">
                            {shot ? (
                              isVideo(shot) ? (
                                <video src={shot} className="w-full h-full object-contain" controls muted />
                              ) : (
                                <img src={shot} className="w-full h-full object-contain" />
                              )
                            ) : (
                              <span className="text-gray-400 text-xs">No Media</span>
                            )}
                            <button type="button" onClick={() => removeScreenshot(idx)} className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs font-bold shadow-md z-10 hover:bg-red-700">×</button>
                         </div>
                         <input type="text" value={shot} onChange={(e) => updateScreenshot(idx, e.target.value)} className={`${inputClass} text-xs mt-2`} placeholder="URL" />
                         <label className={`cursor-pointer text-xs font-bold text-blue-600 flex justify-center mt-2 ${uploading ? 'opacity-50' : ''}`}>
                            <span>📁 ファイル選択</span>
                            <input type="file" accept="image/*,video/*" className="hidden" disabled={uploading} onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await uploadToStorage(file);
                                  if (url) updateScreenshot(idx, url);
                                }
                              }}
                            />
                         </label>
                      </div>
                    ))}
                    <button type="button" onClick={addScreenshot} className="aspect-video border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-500 font-bold hover:bg-white">+</button>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* 価格プラン */}
            <section>
              <h2 className="text-xl font-black text-black mb-6 border-b pb-2">価格プラン</h2>
              <div className="space-y-6">
                {plans.map((plan, idx) => (
                  <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative">
                     {plans.length > 1 && <button type="button" onClick={() => removePlan(idx)} className="absolute top-4 right-4 text-red-600 text-sm font-bold">削除 ×</button>}
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
                             <input type="number" min="1" value={plan.user_count} onChange={(e) => updatePlan(idx, 'user_count', e.target.value)} className={`${inputClass} text-center`} />
                             <span className="ml-2 text-sm font-bold whitespace-nowrap">人分</span>
                        </div>
                        {plan.type === 'subscription' && (
                          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
                               <input type="number" min="1" value={plan.cycle_duration} onChange={(e) => updatePlan(idx, 'cycle_duration', e.target.value)} className="w-12 p-2 text-center font-bold outline-none" />
                               <select value={plan.cycle_unit} onChange={(e) => updatePlan(idx, 'cycle_unit', e.target.value)} className="flex-1 p-2 font-bold outline-none bg-transparent">
                                  <option value="month">ヶ月</option>
                                  <option value="year">年</option>
                               </select>
                          </div>
                        )}
                     </div>
                  </div>
                ))}
                <button type="button" onClick={addPlan} className="w-full py-3 border-2 border-dashed border-gray-400 rounded-xl font-bold text-gray-600 hover:bg-white">＋ プランを追加</button>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* スペック */}
            <section>
              <h2 className="text-xl font-black text-black mb-6 border-b pb-2">詳細・スペック</h2>
              <div className="space-y-6">
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <div className="mb-4 flex flex-wrap gap-2">
                      {SPEC_TEMPLATES.map(group => group.items.map(item => (
                            <button key={item} type="button" onClick={() => addSpecFromTemplate(item)} className="px-2 py-1 text-[10px] bg-white border border-blue-200 text-blue-600 rounded font-bold shadow-sm">＋ {item}</button>
                      )))}
                  </div>
                  <div className="space-y-3">
                    {specs.map((spec, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input type="text" value={spec.label} onChange={(e) => updateSpec(idx, 'label', e.target.value)} className="w-1/3 p-3 border border-gray-300 rounded-lg font-bold text-sm" placeholder="項目名" />
                        <input type="text" value={spec.value} onChange={(e) => updateSpec(idx, 'value', e.target.value)} className="flex-1 p-3 border border-gray-300 rounded-lg font-bold text-sm" placeholder="内容" />
                        {specs.length > 1 && <button type="button" onClick={() => removeSpec(idx)} className="text-gray-400 hover:text-red-500 font-bold px-2">×</button>}
                      </div>
                    ))}
                    <button type="button" onClick={addSpec} className="text-xs font-bold text-blue-600 mt-2">＋ 空の項目を追加</button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>説明文</label>
                  <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>タグ</label>
                  <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg bg-white">
                  <input id="offline" type="checkbox" checked={isOffline} onChange={(e) => setIsOffline(e.target.checked)} className="w-5 h-5 accent-black" />
                  <label htmlFor="offline" className="text-sm font-bold text-black select-none">オフライン動作</label>
                </div>
              </div>
            </section>

            <div className="pt-4">
              <button type="submit" disabled={saving || uploading} className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all ${saving ? 'bg-gray-400' : 'bg-black hover:bg-gray-900'}`}>
                {saving ? '保存中...' : '変更を保存する 💾'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}