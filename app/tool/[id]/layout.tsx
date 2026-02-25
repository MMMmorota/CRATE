import { Metadata } from 'next';
import { supabase } from '../../../lib/supabase'; // パスは page.tsx と同じです

// ★修正1: params を Promise 型に変更しました
type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // ★修正2: params という「箱」を await で開けてから id を取り出す
  const resolvedParams = await params;
  const toolId = resolvedParams.id;

  // 1. URLのIDを使って、データベースからツールの情報を取得する
  const { data: tool } = await supabase
    .from('tools')
    .select('name, tagline, image_url')
    .eq('id', toolId)
    .single();

  // 2. もしツールが見つからなければ、エラー用の名札を出す
  if (!tool) {
    return {
      title: 'ツールが見つかりません | SEARCRATE',
    };
  }

  // 3. ツールの情報を元に、完璧なSEO名札（メタデータ）を作成！
  return {
    title: `${tool.name} | SEARCRATE`, // 例：「Firite | SEARCRATE」
    description: tool.tagline,         // 検索結果の下に出る説明文
    openGraph: {
      title: `${tool.name} | SEARCRATE`,
      description: tool.tagline,
      images: [tool.image_url],        // X(旧Twitter)などでシェアされた時のデカデカとした画像
    },
    twitter: {
      card: 'summary_large_image',     // 画像を大きく表示する設定
      title: `${tool.name} | SEARCRATE`,
      description: tool.tagline,
      images: [tool.image_url],
    },
  };
}

// 画面の表示は、そのまま page.tsx に任せる
export default function ToolLayout({ children }: Props) {
  return <>{children}</>;
}