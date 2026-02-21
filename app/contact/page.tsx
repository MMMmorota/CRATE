import Link from 'next/link';

export const metadata = {
  title: 'お問い合わせ | SEARCRATE',
};

export default function Contact() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-black text-gray-900 mb-8 border-b pb-4">お問い合わせ</h1>
        
        <p className="text-gray-700 mb-8 text-sm md:text-base leading-relaxed">
          SEARCRATEに関する不具合のご報告、機能のご要望、掲載内容に関するお問い合わせなどはこちらからお願いいたします。<br />
          <span className="text-xs text-gray-500 mt-2 block">
            ※画像やスクリーンショットの添付に対応するため、外部のGoogleフォームへ移動します。
          </span>
        </p>

        {/* ▼▼▼ お問い合わせボタン ▼▼▼ */}
        <div className="w-full flex justify-center py-8">
          <a 
            // ▼ ここにGoogleフォームのURL（https://docs.google.com/forms/d/e/.../viewform）を貼り付けてください ▼
            href="https://forms.gle/jcXDfa5NoN2NqLEE6" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg flex items-center gap-3 transform hover:scale-105"
          >
            <span>お問い合わせフォームを開く</span>
            <span className="text-xl">↗</span>
          </a>
        </div>
        {/* ▲▲▲ ここまで ▲▲▲ */}

        <div className="mt-12 text-center border-t pt-8">
          <Link href="/" className="text-blue-600 font-bold hover:underline">
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}