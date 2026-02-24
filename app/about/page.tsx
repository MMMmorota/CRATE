import Navbar from '../../components/Navbar';
import StockBar from '../../components/StockBar';
import Link from 'next/link';

export const metadata = {
  title: 'SEARCRATEについて | SEARCRATE - 個人開発・インディー作品の検索サイト',
  description: 'ゲーム、Webサービス、便利ツールなど、個人開発者やインディークリエイターの熱意が詰まった作品を集めた検索サイトです。',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-8">
          SEARCRATEについて
        </h1>
        
        {/* サイトのコンセプト文（既存の素晴らしい文章） */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 mb-6 border-b-2 border-black pb-3 inline-block">
            個人開発の「隠れた名作」が集まる場所。
          </h2>
          
          <div className="space-y-6 text-gray-700 font-bold leading-loose text-lg">
            <p>
              世の中には、個人開発者やインディークリエイターが情熱を込めて作った、素晴らしいゲームやWebサービス、便利ツールが数多く存在します。
            </p>
            <p>
              しかし、そういった<strong className="text-black bg-yellow-100 px-1">「隠れた名作」</strong>の多くは、星の数ほどあるWebサイトやアプリストアの中に埋もれてしまい、本当に必要としている人に届きにくいのが現状です。
            </p>
            <p>
              SEARCRATE（search + crate）は、そんな個人開発の作品にスポットライトを当てるために生まれました。
            </p>
            <p>
              無料で遊べるインディーゲーム、買い切りの便利ツール、日々進化していくサブスクリプションのWebサービス。<br />
              料金形態やジャンルを問わず、クリエイターの<strong className="text-orange-600">「これを作りたい！」</strong>という熱意が詰まった作品を幅広く集めた道具箱（=CRATE）です。
            </p>
            <p>
              あなたがまだ知らない、ワクワクするようなツールやゲームとの出会いが、ここにありますように。<br />
              そして、クリエイターの皆様の情熱が、一人でも多くのユーザーに届きますように。
            </p>
          </div>
        </div>

        {/* ▼▼▼ 追加：Q&Aセクション ▼▼▼ */}
        <div className="mt-20">
          <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
            <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">?</span>
            よくあるご質問 (Q&A)
          </h2>

          <div className="space-y-4">
            {/* 質問1 */}
            <details className="group bg-white border border-gray-200 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex justify-between items-center font-bold cursor-pointer p-5 text-gray-900 list-none hover:bg-gray-50 transition-colors">
                利用は無料ですか？
                <span className="transition duration-300 group-open:-rotate-180">
                  <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </summary>
              <div className="p-5 pt-0 text-gray-600 font-medium leading-relaxed bg-white border-t border-gray-100 mt-2">
                はい、ツールの検索、保存、ご自身の作品の掲載など、すべての機能が完全無料でご利用いただけます。
              </div>
            </details>

            {/* 質問2 */}
            <details className="group bg-white border border-gray-200 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex justify-between items-center font-bold cursor-pointer p-5 text-gray-900 list-none hover:bg-gray-50 transition-colors">
                どんなツールを掲載していいですか？
                <span className="transition duration-300 group-open:-rotate-180">
                  <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </summary>
              <div className="p-5 pt-0 text-gray-600 font-medium leading-relaxed bg-white border-t border-gray-100 mt-2">
                個人開発のWebアプリ、スマホアプリ、PC向けソフトウェア、便利ツールなど、クリエイターが作成されたものであれば大歓迎です！開発中のベータ版でも掲載可能です。
              </div>
            </details>

            {/* 質問3 */}
            <details className="group bg-white border border-gray-200 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex justify-between items-center font-bold cursor-pointer p-5 text-gray-900 list-none hover:bg-gray-50 transition-colors">
                掲載したツールを後から編集・削除できますか？
                <span className="transition duration-300 group-open:-rotate-180">
                  <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </summary>
              <div className="p-5 pt-0 text-gray-600 font-medium leading-relaxed bg-white border-t border-gray-100 mt-2">
                はい、ログイン後に「マイページ」からいつでも自由に情報の編集や、ツールの削除を行うことができます。
              </div>
            </details>

            {/* 質問4 */}
            <details className="group bg-white border border-gray-200 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex justify-between items-center font-bold cursor-pointer p-5 text-gray-900 list-none hover:bg-gray-50 transition-colors">
                パスワードを忘れてしまいました。
                <span className="transition duration-300 group-open:-rotate-180">
                  <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </summary>
              <div className="p-5 pt-0 text-gray-600 font-medium leading-relaxed bg-white border-t border-gray-100 mt-2">
                ログイン画面にある「パスワードを忘れた方」のリンクから、ご登録時のメールアドレスを入力して再設定をお願いいたします。
              </div>
            </details>
          </div>
          
          {/* お問い合わせへの導線 */}
          <div className="mt-12 text-center bg-gray-100 rounded-2xl p-8 border border-gray-200">
             <h3 className="font-bold text-lg mb-2 text-gray-900">その他のご質問・不具合のご報告</h3>
             <p className="text-gray-500 text-sm mb-4">上記で解決しない場合や、不適切なコンテンツのご報告はこちらからお願いいたします。</p>
             {/* ★取得済みのGoogleフォームのURLをここに貼り付けます */}
             <a href="https://forms.gle/jcXDfa5NoN2NqLEE6" target="_blank" rel="noopener noreferrer" className="inline-block bg-white border border-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
               お問い合わせフォームへ
             </a>
          </div>
        </div>
        {/* ▲▲▲ 追加ここまで ▲▲▲ */}

      </div>

      <StockBar />
    </main>
  );
}