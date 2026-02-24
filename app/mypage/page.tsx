"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import { useStock } from '../../context/StockContext';

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // 保存中ローディング用
  

  const [notificationOn, setNotificationOn] = useState(true);
  // 編集用ステート
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  
  const [editNotification, setEditNotification] = useState(true); // ★追加: 通知設定

  // ★追加: 画像用ステート
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const [myTools, setMyTools] = useState<any[]>([]);
  const { items: stockedItems, removeItem } = useStock();
  const [activeTab, setActiveTab] = useState<'stock' | 'published' | 'following'>('stock');
  const [followingList, setFollowingList] = useState<any[]>([]); // ★ 追加: フォローしている人リスト

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // プロファイル取得
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setEditName(profileData.username || '');
        setEditBio(profileData.bio || '');

        setEditNotification(profileData.notification_on ?? true); 
        setNotificationOn(profileData.notification_on ?? true); // ★これを追加！（直接切り替え用）
        // ★追加: 保存されている画像URLをプレビューにセット
        setAvatarPreviewUrl(profileData.avatar_url || null);
      }

      // ツール取得
      const { data: tools } = await supabase
        .from('tools')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (tools) setMyTools(tools);
      const { data: followsData } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id);

      if (followsData && followsData.length > 0) {
        const followingIds = followsData.map(f => f.following_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', followingIds);

        if (profilesData) {
          const combined = followsData.map(f => {
            const p = profilesData.find(profile => profile.id === f.following_id);
            return { ...p, notify_on: f.notify_on };
          });
          setFollowingList(combined);
        }
      }
      setLoading(false);
    };
    init();
  }, [router]);

  // ★追加: ファイル選択時の処理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // サイズ制限 (例: 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("画像サイズは2MB以下にしてください");
      return;
    }
    setAvatarFile(file);
    // プレビュー用のURLを作成
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(previewUrl);
  };

  // ★追加: 画像アップロード処理
  const uploadAvatar = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    // ファイル名を「ユーザーID/ランダムな文字列.拡張子」にする
    const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 公開URLを取得
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // プロフィール保存
  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      let newAvatarUrl = profile?.avatar_url;

      // 新しい画像が選択されていればアップロード
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar(user.id, avatarFile);
      }

      // DB更新データ
      const updates = {
        id: user.id,
        username: editName,
        bio: editBio,
        avatar_url: newAvatarUrl, // ★追加: 画像URLも更新
        notification_on: editNotification, // ★追加: 通知設定を保存
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      
      if (error) throw error;

      setProfile(updates);
      setIsEditing(false);
      setAvatarFile(null); // ファイル選択状態をリセット
      alert("プロフィールを更新しました！✨");

    } catch (error: any) {
      alert("エラーが発生しました: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if (!confirm("本当に削除しますか？\nこの操作は元に戻せません。")) return;
    const { error } = await supabase.from('tools').delete().eq('id', toolId);
    if (error) alert("削除失敗: " + error.message);
    else setMyTools(myTools.filter(t => t.id !== toolId));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleToggleBell = async (targetUserId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // サクサク動かすために画面の見た目を先に変える
    setFollowingList(prev => prev.map(u => 
      u.id === targetUserId ? { ...u, notify_on: newStatus } : u
    ));

    // データベースを更新
    await supabase
      .from('follows')
      .update({ notify_on: newStatus })
      .eq('follower_id', user?.id)
      .eq('following_id', targetUserId);
  };
  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      alert("ユーザーIDをコピーしました！");
    }
  };
  const handleToggleNotification = async () => {
    if (!user) return;
    const newValue = !notificationOn;
    
    // サクサク動かすために、まずは画面の見た目だけを先に変える
    setNotificationOn(newValue); 
    setEditNotification(newValue); // モーダルの中のチェックボックスとも同期させる

    // 裏側でデータベースを更新
    const { error } = await supabase
      .from('profiles')
      .update({ notification_on: newValue })
      .eq('id', user.id);

    if (error) {
      alert("通知設定の保存に失敗しました");
      // 失敗したら元の状態に戻す
      setNotificationOn(!newValue);
      setEditNotification(!newValue);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">読み込み中...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="bg-black text-white py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            
            {/* ★修正: プロフィール画像表示部分 */}
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-gray-700 overflow-hidden shadow-lg">
               {profile?.avatar_url ? (
                 // 画像があれば表示 (object-coverで円形にトリミングされる)
                 <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 // なければイニシャルなどを表示
                 <span className="text-gray-400 select-none">{profile?.username ? profile.username.slice(0, 1) : '👤'}</span>
               )}
            </div>

            <div>
                 <p className="text-2xl font-black mb-1">
                   {profile?.username || <span className="text-gray-400 italic">名前未設定</span>}
                 </p>
                 <p className="text-sm opacity-70 mb-3">{user.email}</p>
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                   <code className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400 font-mono tracking-wider">
                     {user?.id}
                   </code>
                   <button 
                     onClick={copyUserId} 
                     className="text-[10px] bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors font-bold"
                   >
                     📋 コピー
                   </button>
                   
                   {/* ▼▼▼ ここに追加：通知トグルスイッチ ▼▼▼ */}
                   <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-700">
                     <span className="text-[10px] font-bold text-gray-400">新着通知</span>
                     <button
                       onClick={handleToggleNotification}
                       className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${
                         notificationOn ? 'bg-blue-500' : 'bg-gray-600'
                       }`}
                     >
                       <span
                         className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                           notificationOn ? 'translate-x-4' : 'translate-x-1'
                         }`}
                       />
                     </button>
                   </div>
                 </div>

                 <button 
                   onClick={() => {
                     // 編集モードに入るときに現時点のデータをセット
                     setEditName(profile?.username || '');
                     setEditBio(profile?.bio || '');
                     setAvatarPreviewUrl(profile?.avatar_url || null);
                     setEditNotification(profile?.notification_on ?? true); // ★追加
                     setAvatarFile(null);
                     setIsEditing(true);
                   }}
                   className="text-xs bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-1 mx-auto md:mx-0"
                 >
                   ✏️ プロフィール編集
                 </button>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-gray-900 border border-gray-700 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-red-600 hover:border-red-600 transition-all">ログアウト</button>
        </div>
      </div>

      {/* ★編集モーダル */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in relative">
              <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>
              <h2 className="text-xl font-black text-black mb-6 text-center">プロフィール編集</h2>
              
              <div className="space-y-6">
                 {/* ★追加: 画像選択エリア */}
                 <div className="flex flex-col items-center">
                    <label className="cursor-pointer group relative">
                       <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-gray-200 overflow-hidden group-hover:border-blue-400 transition-colors">
                          {avatarPreviewUrl ? (
                            <img src={avatarPreviewUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <span className="text-gray-300">📷</span>
                          )}
                       </div>
                       {/* ホバー時にカメラアイコンを出す */}
                       <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-2xl">📷</span>
                       </div>
                       <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500 mt-2 font-bold">タップして画像を変更</p>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">表示名 (掲載者名)</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg font-bold focus:ring-2 focus:ring-black outline-none"
                      placeholder="ニックネームなど"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">自己紹介</label>
                    <textarea 
                      value={editBio} 
                      onChange={(e) => setEditBio(e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg font-bold h-24 focus:ring-2 focus:ring-black outline-none resize-none"
                      placeholder="どんなツールを作っているかなど..."
                    />
                 </div>

                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm font-bold text-gray-700">🔔 コメント通知を受け取る</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editNotification} 
                        onChange={(e) => setEditNotification(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                 </div>

                 <div className="flex gap-3 pt-2">
                    <button disabled={saving} onClick={() => setIsEditing(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">キャンセル</button>
                    <button disabled={saving} onClick={handleSaveProfile} className="flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center">
                       {saving ? <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : '保存する'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 以下、既存のタブ表示部分 (変更なし) */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px] overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveTab('stock')} className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === 'stock' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50' : 'text-gray-500 hover:bg-gray-50'}`}>📦 保留リスト ({stockedItems.length})</button>
            <button onClick={() => setActiveTab('published')} className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === 'published' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}>🚀 掲載ツール ({myTools.length})</button>

            <button onClick={() => setActiveTab('following')} className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === 'following' ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-50'}`}>👥 フォロー中 ({followingList.length})</button>
          </div>

          <div className="p-8">
            {activeTab === 'stock' && (
              <div>
                {stockedItems.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <p className="text-4xl mb-4">📭</p>
                    <p className="font-bold">保留中のツールはありません</p>
                    <Link href="/" className="inline-block mt-4 text-orange-600 font-bold hover:underline">ツールを探しに行く →</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stockedItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-xl p-4 flex gap-4 items-center bg-white hover:shadow-md transition-shadow relative group">
                        <Link href={`/tool/${item.id}`} className="flex-1 flex gap-4 items-center">
                           <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                             {(item.image?.startsWith('http') || item.image?.startsWith('data:')) ? <img src={item.image} className="w-full h-full object-cover"/> : item.image}
                           </div>
                           <div className="min-w-0">
                             <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                             <p className="text-xs text-gray-500 truncate font-bold bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">{item.planName}</p>
                           </div>
                        </Link>
                        <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 text-gray-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'published' && (
              <div>
                {myTools.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                     <p className="text-4xl mb-4">📝</p>
                     <p className="font-bold">まだツールを掲載していません</p>
                     <Link href="/submit" className="inline-block mt-4 bg-black text-white px-4 py-2 rounded-full font-bold hover:bg-gray-800 transition-colors">＋ 最初のツールを掲載する</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myTools.map((tool) => (
                      <div key={tool.id} className="block group relative">
                        <Link href={`/tool/${tool.id}`} className="block border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white h-full flex flex-col">
                          <div className="h-36 bg-gray-100 overflow-hidden relative border-b border-gray-100">
                             {(tool.image_url?.startsWith('http') || tool.image_url?.startsWith('data:')) ? <img src={tool.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/> : <div className="w-full h-full flex items-center justify-center text-5xl">{tool.image_url || '📦'}</div>}
                          </div>
                          <div className="p-4 flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{tool.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2 font-medium">{tool.tagline}</p>
                          </div>
                        </Link>
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Link href={`/edit/${tool.id}`} className="bg-white/90 backdrop-blur border border-gray-200 text-gray-600 hover:text-blue-600 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors" title="編集">✏️</Link>
                           <button onClick={(e) => { e.preventDefault(); handleDeleteTool(tool.id); }} className="bg-white/90 backdrop-blur border border-gray-200 text-gray-600 hover:text-red-600 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors" title="削除">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'following' && (
              <div className="max-w-2xl mx-auto space-y-3">
                {followingList.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 font-bold">誰もフォローしていません</div>
                ) : (
                  followingList.map((fUser) => (
                    <div key={fUser.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                      <Link href={`/user/${fUser.id}`} className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl overflow-hidden border border-gray-200">
                          {fUser.avatar_url ? <img src={fUser.avatar_url} className="w-full h-full object-cover"/> : '👤'}
                        </div>
                        <span className="font-bold text-gray-900 text-lg hover:underline">{fUser.username || '名称未設定'}</span>
                      </Link>
                      
                      {/* YouTube風のベルマークボタン */}
                      <button 
                        onClick={() => handleToggleBell(fUser.id, fUser.notify_on)}
                        className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-colors ${
                          fUser.notify_on 
                            ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
                            : 'bg-white border border-gray-300 text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {fUser.notify_on ? '🔔 通知オン' : '🔕 通知オフ'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}