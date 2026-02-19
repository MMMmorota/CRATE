"use client";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  autoPlay?: boolean; // 自動再生するかどうか
  controls?: boolean; // 操作バーを出すかどうか
};

export default function SmartMedia({ 
  src, 
  alt = "media", 
  className = "w-full h-full object-cover",
  autoPlay = true,  // デフォルトは自動再生
  controls = false  // デフォルトは操作バーなし
}: Props) {
  // YouTube判定ロジック
  const getYouTubeId = (url: string) => {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(src);
  const isVideo = src?.startsWith('data:video') || src?.match(/\.(mp4|webm|mov)$/i);

  // 1. YouTubeの場合
  if (youtubeId) {
    if (controls) {
      // ▼ 操作バーあり・手動再生モード（ギャラリー用）
      return (
        <div className={`relative bg-black w-full h-full ${className}`}>
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&mute=0&controls=1&playsinline=1`}
            className="w-full h-full"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        </div>
      );
    } else {
      // ▼ 操作バーなし・自動再生モード（アイコン用）
      return (
        <div className={`relative overflow-hidden bg-black pointer-events-none ${className}`}>
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&disablekb=1&playsinline=1`}
            className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2"
            allow="autoplay; encrypted-media"
          />
        </div>
      );
    }
  }

  // 2. 通常の動画ファイル (mp4など) の場合
  if (isVideo) {
    return <video src={src} className={className} autoPlay={autoPlay} muted={autoPlay} loop={autoPlay} playsInline controls={controls} />;
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