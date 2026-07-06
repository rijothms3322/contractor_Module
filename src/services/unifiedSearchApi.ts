import { searchMedicines, Medicine } from "./medicineApi";
import { DEFAULT_TESTS, DEFAULT_MEDICINES } from "../lib/mockData";

export interface UnifiedSearchItem {
  id: string;
  name: string;
  type: "medicine" | "lab_test";
  subtitle: string;
  popularity: number;
  raw: any;
}

// Predefined popularity score boosts for common searches
const POPULARITY_BOOSTS: Record<string, number> = {
  "paracetamol": 120,
  "calpol": 115,
  "atorvastatin": 110,
  "metformin": 105,
  "lisinopril": 95,
  "complete blood count (cbc)": 130,
  "lipid profile": 125,
  "cholesterol": 122,
  "hba1c": 118,
  "fasting blood sugar (fbs)": 112,
  "full body shield": 108,
  "ibuprofen": 100,
  "brufen": 98,
  "cetirizine": 96,
  "alerid": 94,
  "omeprazole": 92
};

export const searchUnified = async (query: string): Promise<UnifiedSearchItem[]> => {
  if (!query) return [];
  const lower = query.toLowerCase().trim();

  // 1. Search Medicines (delegates to standard medicineApi)
  const medicines = await searchMedicines(query);
  const medicineResults: UnifiedSearchItem[] = medicines.map(m => {
    const medLower = m.name.toLowerCase();
    let popularity = 10; // baseline
    for (const [key, score] of Object.entries(POPULARITY_BOOSTS)) {
      if (medLower.includes(key)) {
        popularity = score;
        break;
      }
    }
    return {
      id: m.id,
      name: m.name,
      type: "medicine",
      subtitle: `${m.dosage} • ${m.instructions}`,
      popularity,
      raw: m
    };
  });

  // 2. Search Lab Tests (matches against default lab packages)
  const labTests = DEFAULT_TESTS.filter(t => 
    t.name.toLowerCase().includes(lower) || 
    t.description.toLowerCase().includes(lower)
  );
  
  const testResults: UnifiedSearchItem[] = labTests.map(t => {
    const testLower = t.name.toLowerCase();
    let popularity = 20; // baseline
    for (const [key, score] of Object.entries(POPULARITY_BOOSTS)) {
      if (testLower.includes(key)) {
        popularity = score;
        break;
      }
    }
    return {
      id: t.id,
      name: t.name,
      type: "lab_test",
      subtitle: `${t.parametersCount} Parameters • ${t.description.slice(0, 75)}...`,
      popularity,
      raw: t
    };
  });

  // Combine and sort by popularity (descending)
  const combined = [...medicineResults, ...testResults];
  return combined.sort((a, b) => b.popularity - a.popularity);
};
