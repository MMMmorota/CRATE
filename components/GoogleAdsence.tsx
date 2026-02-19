"use client";

import Script from "next/script";

type Props = {
  pId: string; // Google AdSenseのパブリッシャーID
};

const GoogleAdsense = ({ pId }: Props) => {
  // 開発環境（自分のPC）では広告を表示しない設定
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};

export default GoogleAdsense;