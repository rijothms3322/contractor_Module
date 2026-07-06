import { supabase } from '@/lib/supabaseClient';
import { Medicine as MedicineType, DEFAULT_MEDICINES } from '@/lib/mockData';
export type Medicine = MedicineType;

/**
 * Searches medicines by query using full‑text search on the `generic_name` and `brand_name` columns.
 * Returns an array of Medicine objects. Falls back to mock data if Supabase is not configured.
 */
export const searchMedicines = async (query: string): Promise<Medicine[]> => {
  if (!query) return [];
  // Fallback to mock data for development/demo mode
  if (!supabase) {
    const lower = query.toLowerCase();
    return DEFAULT_MEDICINES.filter(
      (m) => m.name.toLowerCase().includes(lower) || m.dosage.toLowerCase().includes(lower)
    ).slice(0, 20);
  }
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .or(`generic_name.ilike.%${query}%,brand_name.ilike.%${query}%`)
    .order('generic_name', { ascending: true })
    .limit(20);
  if (error) {
    console.error('Medicine search error (falling back to mock data):', error);
    const lower = query.toLowerCase();
    return DEFAULT_MEDICINES.filter(
      (m) => m.name.toLowerCase().includes(lower) || m.dosage.toLowerCase().includes(lower)
    ).slice(0, 20);
  }
  return (data || []).map((m: any) => ({
    id: m.id,
    name: m.generic_name ?? m.brand_name ?? '',
    dosage: m.strength ?? '',
    instructions: m.dosage_form ?? '',
    frequency: m.schedule_type ?? 'daily',
    timings: [],
    startDate: m.created_at,
    endDate: m.end_date ?? undefined,
  }));
};
