// frontend/app/terms/page.tsx
import React from 'react';

export const metadata = {
  title: '利用規約 | Searcrate',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b">利用規約</h1>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <p>
              この利用規約（以下、「本規約」といいます。）は、Searcrate（以下、「本サービス」といいます。）が提供するサービスの利用条件を定めるものです。ユーザーの皆さまには、本規約に従って本サービスをご利用いただきます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">第1条（適用）</h2>
            <p>本規約は、ユーザーと本サービスとの間の本サービスの利用に関わる一切の関係に適用されるものとします。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-600 mb-3 border-l-4 border-red-500 pl-3">第2条（掲載コンテンツの比較・評価への同意）</h2>
            <p className="mb-2 font-medium">本サービスは、様々なツールやソフトウェアを検索・比較することを目的としています。ユーザーが本サービスにコンテンツを投稿・掲載する場合、以下の事項に完全に同意したものとみなします。</p>
            <ul className="list-disc pl-6 space-y-2 bg-red-50 p-4 rounded-md">
              <li>掲載されたコンテンツが、本サービス内において他のコンテンツと価格、性能、機能、デザイン等のあらゆる面で比較・評価されること。</li>
              <li>本サービスのシステム、または他のユーザーによるレビューや評価によって、優劣がつけられる可能性があること。</li>
              <li>これらの比較、評価、ランキング等によって掲載者または第三者に何らかの不利益や損害が生じた場合でも、本サービスの運営者に対して一切の異議申し立て、削除請求、および損害賠償請求を行わないこと。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">第3条（禁止事項）</h2>
            <p className="mb-2">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
              <li>わいせつ、暴力的なコンテンツ、またはスパム等の不適切なコンテンツを投稿する行為</li>
            </ul>
            <p className="mt-2 text-sm text-gray-500">※運営者が不適切と判断したコンテンツは、事前の予告なく削除できるものとします。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">第4条（免責事項）</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>運営者は、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しておりません。</li>
              <li>運営者は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。</li>
              <li>本サービスにおいて、ユーザー間またはユーザーと第三者の間で生じたトラブル・紛争について、運営者は一切責任を負わないものとします。</li>
            </ul>
          </section>

          <section className="pt-6 border-t mt-8 text-sm text-gray-500 text-right">
            <p>制定日：2026年2月22日</p>
          </section>
        </div>
      </div>
    </div>
  );
}