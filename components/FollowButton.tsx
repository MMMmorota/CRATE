'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // ※Supabaseのパスが違う場合は微調整してください

type FollowButtonProps = {
  targetUserId: string; // プロフィール画面の主のID
};

export default function FollowButton({ targetUserId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 画面が開かれたときに、フォロワー数と現在のフォロー状態を取得する
  useEffect(() => {
    const fetchFollowData = async () => {
      // 1. 現在ログインしている自分のIDを取得
      const { data: { session } } = await supabase.auth.getSession();
      const myId = session?.user?.id;
      if (myId) setCurrentUserId(myId);

      // 2. このユーザーの合計フォロワー数を取得
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId);
      
      setFollowerCount(count || 0);

      // 3. 自分がすでにこの人をフォローしているかチェック
      if (myId) {
        const { data } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', myId)
          .eq('following_id', targetUserId)
          .single();
        
        if (data) setIsFollowing(true);
      }
      setIsLoading(false);
    };

    fetchFollowData();
  }, [targetUserId]);

  // ボタンを押したときの処理（フォロー / 解除）
  const handleToggleFollow = async () => {
    if (!currentUserId) {
      alert('フォロー機能を利用するにはログインが必要です！');
      return;
    }
    if (currentUserId === targetUserId) {
      // 自分自身はフォローできないようにブロック
      return;
    }

    setIsLoading(true);

    if (isFollowing) {
      // フォロー解除処理
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);
      
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
    } else {
      // フォロー登録処理
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId });
      
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
    }
    
    setIsLoading(false);
  };

  // 自分自身のプロフィールを見ている時はボタンを隠す
  if (currentUserId === targetUserId) {
    return (
      <div className="mt-4 text-sm text-gray-600 font-medium">
        フォロワー: <span className="font-bold text-gray-900">{followerCount}</span> 人
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      <span className="text-sm text-gray-600 font-medium">
        フォロワー: <span className="font-bold text-gray-900">{followerCount}</span> 人
      </span>
      <button
        onClick={handleToggleFollow}
        disabled={isLoading}
        className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-200 shadow-sm ${
          isFollowing 
            ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200' 
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
        } disabled:opacity-50`}
      >
        {isLoading ? '読込中...' : isFollowing ? 'フォロー中' : '＋ フォローする'}
      </button>
    </div>
  );
}