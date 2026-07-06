import { Medicine } from "../lib/mockData";

export interface WellnessRecommendation {
  id: string;
  category: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  durationMinutes: number;
  healthBenefit: string;
  frequency: string;
  icon: string;
  instructions: string[];
}

const WELLNESS_DB: Record<string, WellnessRecommendation[]> = {
  diabetes: [
    {
      id: "w-diab-1",
      category: "Exercise",
      title: "Daily Brisk Walk",
      difficulty: "Beginner",
      durationMinutes: 30,
      healthBenefit: "Supports blood sugar stabilization",
      frequency: "Daily",
      icon: "directions_walk",
      instructions: ["Wear comfortable shoes", "Walk at a pace where you can still talk", "Stay hydrated"]
    },
    {
      id: "w-diab-2",
      category: "Lifestyle",
      title: "Low-Impact Cardio",
      difficulty: "Intermediate",
      durationMinutes: 20,
      healthBenefit: "Improves cardiovascular health",
      frequency: "3x a week",
      icon: "monitor_heart",
      instructions: ["Start with light stretching", "Use stationary bike or elliptical", "Monitor heart rate"]
    }
  ],
  bp: [
    {
      id: "w-bp-1",
      category: "Mindfulness",
      title: "Guided Meditation",
      difficulty: "Beginner",
      durationMinutes: 15,
      healthBenefit: "May assist with stress and blood pressure management",
      frequency: "Daily",
      icon: "self_improvement",
      instructions: ["Find a quiet spot", "Focus on your breath", "Let thoughts pass naturally"]
    },
    {
      id: "w-bp-2",
      category: "Exercise",
      title: "Restorative Yoga",
      difficulty: "Beginner",
      durationMinutes: 20,
      healthBenefit: "Promotes relaxation and flexibility",
      frequency: "2x a week",
      icon: "accessibility_new",
      instructions: ["Use a yoga mat", "Focus on gentle stretches", "Don't push past your limits"]
    }
  ],
  thyroid: [
    {
      id: "w-thyr-1",
      category: "Exercise",
      title: "Morning Sunlight Walk",
      difficulty: "Beginner",
      durationMinutes: 20,
      healthBenefit: "Supports energy levels and metabolism",
      frequency: "Daily morning",
      icon: "light_mode",
      instructions: ["Walk outside in morning light", "Keep a moderate pace", "Breathe deeply"]
    }
  ],
  vitamin: [
    {
      id: "w-vit-1",
      category: "Lifestyle",
      title: "Outdoor Activity",
      difficulty: "Beginner",
      durationMinutes: 30,
      healthBenefit: "Natural sunlight helps with Vitamin synthesis",
      frequency: "Daily",
      icon: "nature",
      instructions: ["Spend time in a park or garden", "Use sunscreen if needed", "Combine with light exercise"]
    }
  ],
  general: [
    {
      id: "w-gen-1",
      category: "Lifestyle",
      title: "Hydration Focus",
      difficulty: "Beginner",
      durationMinutes: 5,
      healthBenefit: "Essential for all bodily functions",
      frequency: "Throughout the day",
      icon: "water_drop",
      instructions: ["Drink 8 glasses of water", "Keep a water bottle nearby", "Drink before meals"]
    },
    {
      id: "w-gen-2",
      category: "Exercise",
      title: "Evening Stretching",
      difficulty: "Beginner",
      durationMinutes: 10,
      healthBenefit: "Improves sleep quality and flexibility",
      frequency: "Nightly",
      icon: "airline_seat_recline_normal",
      instructions: ["Stretch major muscle groups", "Hold each stretch for 30s", "Breathe deeply"]
    }
  ]
};

export const wellnessService = {
  getRecommendations: (medicines: Medicine[]): WellnessRecommendation[] => {
    let recommendations: WellnessRecommendation[] = [];
    const addedCategories = new Set<string>();

    medicines.forEach(med => {
      const name = med.name.toLowerCase();
      
      if (name.includes("metformin") || name.includes("insulin") || name.includes("glimepiride")) {
        addedCategories.add("diabetes");
      }
      if (name.includes("atorvastatin") || name.includes("amlodipine") || name.includes("losartan") || name.includes("telmisartan") || name.includes("bp")) {
        addedCategories.add("bp");
      }
      if (name.includes("thyroxine") || name.includes("eltroxin") || name.includes("thyroid")) {
        addedCategories.add("thyroid");
      }
      if (name.includes("vitamin") || name.includes("calcium") || name.includes("d3") || name.includes("supplement")) {
        addedCategories.add("vitamin");
      }
    });

    if (addedCategories.size === 0) {
      addedCategories.add("general");
    }

    addedCategories.forEach(cat => {
      if (WELLNESS_DB[cat]) {
        recommendations = [...recommendations, ...WELLNESS_DB[cat]];
      }
    });

    // Add some general ones if too few
    if (recommendations.length < 3) {
      WELLNESS_DB["general"].forEach(rec => {
        if (!recommendations.find(r => r.id === rec.id)) {
          recommendations.push(rec);
        }
      });
    }

    return recommendations.slice(0, 5); // Return top 5
  },
  
  getWellnessScore: (streak: number): number => {
    // Simple mock logic for wellness score
    return Math.min(100, 60 + (streak * 2));
  },
  
  getConditionsInsights: (medicines: Medicine[]): string[] => {
    const insights: string[] = [];
    const medNames = medicines.map(m => m.name.toLowerCase());
    
    if (medNames.some(n => n.includes("metformin") || n.includes("insulin"))) {
      insights.push("Consistency with exercise can support healthy blood sugar levels.");
    }
    if (medNames.some(n => n.includes("atorvastatin") || n.includes("amlodipine"))) {
      insights.push("Your medicines may be related to blood pressure or cholesterol management. Light cardio can help.");
    }
    
    if (insights.length === 0) {
      insights.push("Staying active daily supports your overall medication and wellness journey.");
    }
    return insights;
  }
};
