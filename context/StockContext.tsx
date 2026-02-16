"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 保存するデータの型
export type StockItem = {
  id: string;
  name: string;
  price: number;
  planName: string; // 選んだプラン名（Standardなど）
  image: string;    // サムネイル画像
};

type StockContextType = {
  items: StockItem[];
  addItem: (item: StockItem) => void;
  removeItem: (id: string) => void;
  isInStock: (id: string) => boolean;
};

const StockContext = createContext<StockContextType | undefined>(undefined);

export function StockProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StockItem[]>([]);

  // 1. 初回読み込み時に、ブラウザの保存領域(localStorage)から復元する
  useEffect(() => {
    const saved = localStorage.getItem('crate_stock');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // 2. データが変わるたびに保存する
  useEffect(() => {
    localStorage.setItem('crate_stock', JSON.stringify(items));
  }, [items]);

  // 追加
  const addItem = (item: StockItem) => {
    // すでに同じIDがあれば追加しない
    if (items.some((i) => i.id === item.id)) return;
    setItems([...items, item]);
  };

  // 削除
  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  // チェック
  const isInStock = (id: string) => {
    return items.some((i) => i.id === id);
  };

  return (
    <StockContext.Provider value={{ items, addItem, removeItem, isInStock }}>
      {children}
    </StockContext.Provider>
  );
}

// 簡単に使うためのカスタムフック
export function useStock() {
  const context = useContext(StockContext);
  if (!context) throw new Error('useStock must be used within a StockProvider');
  return context;
}