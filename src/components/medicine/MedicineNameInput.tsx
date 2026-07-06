import React, { useState } from 'react';
import { useMedicineSearch } from '@/hooks/useMedicineSearch';
import { Medicine } from '@/services/medicineApi';

interface MedicineNameInputProps {
  value: string;
  onChange: (val: string) => void;
}

export const MedicineNameInput: React.FC<MedicineNameInputProps> = ({ value, onChange }) => {
  const { query, setQuery, results, loading } = useMedicineSearch();
  const [showList, setShowList] = useState(false);

  // Sync external value with internal query when user selects from other UI
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setShowList(true);
  };

  const handleSelect = (med: Medicine) => {
    onChange(med.name);
    setQuery(med.name);
    setShowList(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="e.g. Metformin"
        required
        value={value}
        onChange={handleInputChange}
        className="w-full px-4 py-2.5 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
        onFocus={() => setShowList(true)}
        onBlur={() => setTimeout(() => setShowList(false), 200)} // delay to allow click
      />
      {loading && <p className="text-xs text-muted mt-1">Loading…</p>}
      {showList && results.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-outline-variant/30 rounded-xl shadow-lg">
          {results.map((med) => (
            <li
              key={med.id}
              className="p-2 cursor-pointer hover:bg-surface-container-low"
              onMouseDown={() => handleSelect(med)}
            >
              <div className="font-medium text-sm">{med.name}</div>
              <div className="text-xs text-on-surface-variant">{med.dosage}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
