import { MetadataRoute } from 'next';
import { supabase } from '../lib/supabase'; // パスが違う場合は微調整してください

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://SEARCRATE-smoky.vercel.app';

  // ① Supabaseから登録されているすべてのツールを取得
  const { data: tools } = await supabase
    .from('tools')
    .select('id, updated_at');

  // ② 取得したツールから、動的な詳細ページ(/tool/[id])のURLリストを作成
  const toolUrls: MetadataRoute.Sitemap = tools?.map((tool) => ({
    url: `${baseUrl}/tool/${tool.id}`,
    lastModified: new Date(tool.updated_at || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) || [];

  // ③ 静的なページ（トップ、比較、投稿など）と動的なページを合体させる
  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0, // トップページを一番優先（1.0）
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...toolUrls,
  ];
}