"use client";

import { useState, useRef } from 'react';

type Props = {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  availableTags: string[];
  className?: string; // ★追加: 親からスタイルを指定できるようにする
};

export default function TagSearchInput({ tags, onTagsChange, searchQuery, setSearchQuery, availableTags, className = "" }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTags = availableTags.filter(t => 
    !tags.includes(t) && 
    t.toLowerCase().includes(searchQuery.replace('#', '').toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = searchQuery.trim();
      if (val) {
        const newTag = val.replace(/^#/, '');
        if (!tags.includes(newTag)) {
          onTagsChange([...tags, newTag]);
        }
        setSearchQuery('');
        setShowSuggestions(false);
      }
    } else if (e.key === 'Backspace' && searchQuery === '' && tags.length > 0) {
      const newTags = [...tags];
      newTags.pop();
      onTagsChange(newTags);
    }
  };

  const addTag = (tag: string) => {
    onTagsChange([...tags, tag]);
    setSearchQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onTagsChange(newTags);
  };

  return (
    <div className={`relative group w-full ${className}`}>
      <div 
        className={`flex flex-wrap items-center gap-2 px-3 py-2 bg-gray-100 border rounded-lg transition-all cursor-text ${
          isFocused ? 'border-black ring-1 ring-black/10 bg-white' : 'border-transparent hover:bg-gray-200'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        <span className="text-gray-400 select-none">🔍</span>

        {tags.map((tag, index) => (
          <span key={index} className="bg-black text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 animate-fade-in whitespace-nowrap">
            #{tag}
            <button 
              onClick={(e) => { e.stopPropagation(); removeTag(index); }}
              className="w-3 h-3 bg-gray-600 rounded-full hover:bg-red-500 flex items-center justify-center text-[8px] text-white transition-colors"
            >
              ✕
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={tags.length === 0 ? "キーワード検索 / #タグ" : "追加..."}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-black font-bold placeholder-gray-400 text-sm h-6"
        />
      </div>

      {showSuggestions && filteredTags.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
          <div className="p-2 text-xs font-bold text-gray-400 bg-gray-50 border-b border-gray-100">候補のタグ</div>
          {filteredTags.map((tag) => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-900 font-bold transition-colors flex items-center gap-2 border-b border-gray-50"
            >
              <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded">#</span>
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}