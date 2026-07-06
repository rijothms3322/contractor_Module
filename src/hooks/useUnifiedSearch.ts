import { useState, useEffect, useRef } from "react";
import { searchUnified, UnifiedSearchItem } from "@/services/unifiedSearchApi";

export const useUnifiedSearch = (initialQuery = "") => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<UnifiedSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchUnified(query);
        setResults(data);
      } catch (err) {
        console.error("Unified search hook error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, [query]);

  return { query, setQuery, results, loading };
};
