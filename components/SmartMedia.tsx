"use client";

type Props = {
  src: string;
  alt?: string;
  className?: string;
};

export default function SmartMedia({ src, alt = "media", className = "w-full h-full object-cover" }: Props) {
  // YouTubeのURLからIDを抜き出す魔法の数式（正規表現）
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(src);
  const isVideo = src?.startsWith('data:video') || src?.match(/\.(mp4|webm|mov)$/i);

  // 1. YouTubeの場合（自動再生・ミュート・ループ・クリック操作不可）
  if (youtubeId) {
    return (
      <div className={`relative overflow-hidden bg-black pointer-events-none ${className}`}>
        {/* YouTube特有の黒帯を消すために、150%に拡大して中央配置しています */}
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&disablekb=1&playsinline=1`}
          className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2"
          allow="autoplay; encrypted-media"
        />
      </div>
    );
  }

  // 2. 通常の動画ファイル (mp4など) の場合
  if (isVideo) {
    return <video src={src} className={className} autoPlay muted loop playsInline />;
  }

  // 3. 画像URLの場合
  if (src && (src.startsWith('http') || src.startsWith('data:'))) {
    return <img src={src} alt={alt} className={className} />;
  }

  // 4. 絵文字やテキストの場合
  return (
    <div className={`flex items-center justify-center text-5xl select-none bg-gray-50 ${className}`}>
      {src || '📦'}
    </div>
  );
}