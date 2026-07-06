"use client";

import React, { useRef, useEffect, useState } from "react";
import { useUnifiedSearch } from "@/hooks/useUnifiedSearch";
import { UnifiedSearchItem } from "@/services/unifiedSearchApi";

interface PredictiveSearchProps {
  onSelectItem?: (item: UnifiedSearchItem) => void;
  placeholder?: string;
}

export const PredictiveSearch: React.FC<PredictiveSearchProps> = ({
  onSelectItem,
  placeholder = "Search medicines, lab tests..."
}) => {
  const { query, setQuery, results, loading } = useUnifiedSearch();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (item: UnifiedSearchItem) => {
    setQuery("");
    setIsOpen(false);
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full z-30">
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-4 text-outline text-xl">search</span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-3.5 bg-surface-container/60 border border-outline-variant/30 rounded-2xl font-body-md text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
        />
        {loading && (
          <span className="absolute right-4 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-outline-variant/35 rounded-2xl shadow-2xl max-h-72 overflow-y-auto z-40 divide-y divide-outline-variant/10 animate-in fade-in slide-in-from-top-1 duration-150">
          {results.map((item) => {
            const isMed = item.type === "medicine";
            return (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                className="p-3.5 hover:bg-surface-container-low cursor-pointer flex justify-between items-center transition-all gap-4"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isMed ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                  }`}>
                    <span className="material-symbols-outlined text-lg">
                      {isMed ? "pill" : "science"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-label-md text-xs text-secondary font-bold truncate">
                      {item.name}
                    </div>
                    <div className="font-body-md text-[10px] text-on-surface-variant truncate mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isMed ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                }`}>
                  {isMed ? "Medicine" : "Lab Test"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
