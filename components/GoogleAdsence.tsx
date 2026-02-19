"use client";

import Script from "next/script";

type Props = {
  pId: string; // Google AdSenseのパブリッシャーID
};

const GoogleAdsense = ({ pId }: Props) => {
  if (process.env.NODE_ENV !== "production") {
    // 開発環境（ローカル）では広告を表示しない
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};

export default GoogleAdsense;