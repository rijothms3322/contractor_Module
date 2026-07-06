import { useState, useEffect, useRef } from 'react';
import { searchMedicines, Medicine } from '@/services/medicineApi';

/** Hook that debounces the query and returns search results */
export const useMedicineSearch = (initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      const data = await searchMedicines(query);
      setResults(data);
      setLoading(false);
    }, 300);
  }, [query]);

  return { query, setQuery, results, loading };
};
