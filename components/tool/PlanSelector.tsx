"use client";

// 受け取るデータの型定義（TypeScriptのお約束）
type Plan = {
  id: string;
  name: string;
  price: number;
  type: string;
  desc: string;
};

type Props = {
  plans: Plan[];
  selectedPlanId: string;
  onSelect: (id: string) => void;
};

export default function PlanSelector({ plans, selectedPlanId, onSelect }: Props) {
  return (
    <div className="mb-10">
      <h3 className="font-bold text-gray-900 mb-4 text-lg">プランを選択して比較・保存</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            onClick={() => onSelect(plan.id)}
            className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative ${
              selectedPlanId === plan.id 
                ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200 ring-offset-2' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {selectedPlanId === plan.id && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                選択中
              </div>
            )}
            <h4 className={`font-bold text-sm mb-1 ${selectedPlanId === plan.id ? 'text-orange-900' : 'text-gray-900'}`}>
              {plan.name}
            </h4>
            <div className="text-xl font-black mb-2">
              ¥{plan.price.toLocaleString()}
              <span className="text-xs font-normal text-gray-600 ml-1">
                /{plan.type === 'One-time' ? '回' : '年'}
              </span>
            </div>
            <p className="text-xs text-gray-700 leading-tight">{plan.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}