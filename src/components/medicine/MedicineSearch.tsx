import React, { useEffect, useState, useRef } from 'react';
import { useMedicineSearch } from '@/hooks/useMedicineSearch';
import { Medicine } from '@/services/medicineApi';

export const MedicineSearch: React.FC<{
  onSelect: (med: Medicine) => void;
  onChange?: (value: string) => void;
  initialValue?: string;
}> = ({ onSelect, onChange, initialValue = '' }) => {
  const { query, setQuery, results, loading } = useMedicineSearch(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialValue !== undefined && initialValue !== query) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  // Click outside detection to hide recommendations
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (med: Medicine) => {
    onSelect(med);
    setQuery(med.name);
    if (onChange) onChange(med.name);
    setShowSuggestions(false);
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (onChange) onChange(val);
    setShowSuggestions(true);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        placeholder="Search medicines..."
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        className="w-full px-4 py-2.5 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
      />
      {loading && <p className="text-xs text-outline mt-1 animate-pulse">Searching...</p>}
      {showSuggestions && results.length > 0 && (
        <ul className="absolute left-0 right-0 mt-1 bg-white border border-outline-variant/30 rounded-xl max-h-48 overflow-y-auto z-50 shadow-lg divide-y divide-outline-variant/10">
          {results.map((med: Medicine) => (
            <li key={med.id} className="p-2.5 hover:bg-surface-container-low cursor-pointer transition-colors" onClick={() => handleSelect(med)}>
              <div className="font-label-md text-xs font-bold text-secondary">{med.name}</div>
              <div className="text-[10px] text-on-surface-variant mt-0.5">{med.dosage}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

