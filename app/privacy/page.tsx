import Link from 'next/link';

export const metadata = {
  title: 'プライバシーポリシー | SEARCRATE',
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-black text-gray-900 mb-8 border-b pb-4">プライバシーポリシー</h1>

        <div className="space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. 広告の配信について</h2>
            <p>
              当サイト「SEARCRATE」は、第三者配信の広告サービス（Google AdSense等）を利用する予定、または利用しています。<br />
              広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookie（クッキー）を使用することがあります。<br />
              Cookieを無効にする設定およびGoogleアドセンスに関する詳細は「<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">広告 – ポリシーと規約 – Google</a>」をご覧ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. アクセス解析ツールについて</h2>
            <p>
              当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。<br />
              このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. 個人情報の利用目的</h2>
            <p>
              当サイトでは、ユーザー登録やお問い合わせの際に、名前（ハンドルネーム）やメールアドレス等の個人情報をご登録いただく場合がございます。<br />
              これらの個人情報は、質問に対する回答や必要な情報を電子メールなどを利用してご連絡する場合に利用させていただくものであり、個人情報をご提供いただく際の目的以外では利用いたしません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. 免責事項</h2>
            <p>
              当サイトからのリンクやバナーなどで移動したサイトで提供される情報、サービス等について一切の責任を負いません。<br />
              また当サイトのコンテンツ・情報について、できる限り正確な情報を掲載するよう努めておりますが、正確性や安全性を保証するものではありません。情報が古くなっていることもございます。<br />
              当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. 著作権について</h2>
            <p>
              当サイトで掲載している文章や画像などにつきましては、無断転載することを禁止します。<br />
              当サイトは著作権や肖像権の侵害を目的としたものではありません。著作権や肖像権に関して問題がございましたら、お問い合わせよりご連絡ください。迅速に対応いたします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. プライバシーポリシーの変更について</h2>
            <p>
              当サイトは、個人情報に関して適用される日本の法令を遵守するとともに、本ポリシーの内容を適宜見直しその改善に努めます。<br />
              修正された最新のプライバシーポリシーは常に本ページにて開示されます。
            </p>
          </section>

          <div className="pt-8 text-right text-gray-500 text-sm">
            <p>制定日：2026年2月19日</p>
          </div>

        </div>

        <div className="mt-12 text-center border-t pt-8">
          <Link href="/" className="text-blue-600 font-bold hover:underline">
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}