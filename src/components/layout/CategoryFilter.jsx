import React from 'react';
import { CATEGORIES } from '../../data/categories';

export const CategoryFilter = ({ selected, onChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all text-sm ${
          selected === null
            ? 'bg-blue-500 text-white shadow-sm'
            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        All Topics
      </button>
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all text-sm ${
            selected === cat.id
              ? 'text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
          style={{
            backgroundColor: selected === cat.id ? cat.color : undefined
          }}
        >
          {cat.icon} {cat.name}
        </button>
      ))}
    </div>
  );
};