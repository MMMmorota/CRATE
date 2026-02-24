"use client";

import FollowButton from '@/components/FollowButton';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import Navbar from '../../../components/Navbar';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  
  const [profile, setProfile] = useState<any>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // 1. プロフィール取得
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      setProfile(profileData);

      // 2. このユーザーのツール一覧取得
      const { data: toolsData } = await supabase
        .from('tools')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      setTools(toolsData || []);
      setLoading(false);
    };

    if (userId) fetchUser();
  }, [userId]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold">読み込み中...</div>;

  const userExists = profile || tools.length > 0;

  if (!userExists && !loading) {
     return (
        <main className="min-h-screen bg-gray-50">
           <Navbar />
           <div className="text-center py-20">
              <p className="text-xl font-bold text-gray-500">ユーザーが見つかりません</p>
              <p className="text-sm text-gray-400 mt-2">ID: {userId}</p>
              <Link href="/" className="text-blue-600 font-bold hover:underline mt-4 inline-block">トップに戻る</Link>
           </div>
        </main>
     );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col items-center text-center">
           
           {/* 画像表示 */}
           <div className="w-24 h-24 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-lg border-4 border-white overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <span>{profile?.username ? profile.username.slice(0, 1) : '?'}</span>
              )}
           </div>

           <h1 className="text-3xl font-black text-black mb-2">
              {profile?.username || '名称未設定ユーザー'}
           </h1>
           {profile?.bio ? (
             <p className="text-gray-600 font-medium max-w-lg whitespace-pre-wrap">{profile.bio}</p>
           ) : (
             <p className="text-gray-400 text-sm">自己紹介はまだありません。</p>
           )}
           
           {/* ★ここに追加！ フォローボタンコンポーネント */}
           <div className="mt-4 mb-2">
             <FollowButton targetUserId={userId} />
           </div>

           <div className="mt-4 flex gap-4 text-sm font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
              <span>🚀 {tools.length} ツール公開中</span>
           </div>
        </div>
      </div>

      {/* ツール一覧 */}
      <div className="max-w-5xl mx-auto px-4 py-12">
         <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
           <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">📦</span>
           公開中のツール
         </h2>
         
         {tools.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-400 font-bold">まだ公開されているツールはありません。</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {tools.map((tool) => (
                  <Link href={`/tool/${tool.id}`} key={tool.id} className="block group">
                     <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                        <div className="h-40 bg-gray-100 overflow-hidden relative border-b border-gray-100">
                           {(tool.image_url?.startsWith('http') || tool.image_url?.startsWith('data:')) ? (
                              <img src={tool.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-5xl">{tool.image_url || '📦'}</div>
                           )}
                        </div>
                        <div className="p-5 flex-1">
                           <h3 className="text-lg font-black text-black mb-1 group-hover:text-blue-600 transition-colors">{tool.name}</h3>
                           <p className="text-xs text-gray-500 line-clamp-2">{tool.tagline}</p>
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         )}
      </div>
    </main>
  );
}