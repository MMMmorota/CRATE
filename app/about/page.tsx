import Navbar from '../../components/Navbar';
import StockBar from '../../components/StockBar';

export const metadata = {
  title: 'CRATEについて | CRATE - 個人開発・インディー作品の検索サイト',
  description: 'ゲーム、Webサービス、便利ツールなど、個人開発者やインディークリエイターの熱意が詰まった作品を集めた検索サイトです。',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-8">
          CRATEについて
        </h1>
        
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
              CRATE（クレート）は、そんな個人開発の作品にスポットライトを当てるために生まれました。
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
      </div>

      <StockBar />
    </main>
  );
}