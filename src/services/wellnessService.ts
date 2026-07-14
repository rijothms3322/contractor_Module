import { Medicine } from "../lib/mockData";

export const DEFAULT_AI_INSIGHTS = [
  "Drinking a warm glass of water right after waking up helps jumpstart your metabolism and hydrates your cells after a long night of sleep.",
  "Taking a short 10-minute walk after your meals is an easy and effective way to support digestion and keep your energy levels steady.",
  "Consistency is key to wellness. Try to keep your daily routines, meals, and rest times aligned to support your body's natural circadian rhythm.",
  "Taking a few deep, slow breaths can instantly calm your nervous system, reduce muscle tension, and bring focus back to your day.",
  "Keeping a reusable water bottle near your workspace is a simple habit to ensure you stay consistently hydrated throughout the day.",
  "Regular, gentle stretching helps maintain flexibility, relieves joint stiffness, and improves blood circulation across your body.",
  "Prioritizing 7 to 8 hours of quality sleep tonight will give your body the rest it needs to repair cells and restore natural energy.",
  "Reducing your daily sodium intake by choosing fresh herbs over salt is a great habit that supports long-term heart and arterial health.",
  "Linking a new healthy habit to an existing daily routine—like stretching while tea brews—makes it much easier to stay consistent.",
  "Taking breaks to rest your eyes and stretch your shoulders every hour helps prevent fatigue when working at a desk.",
  "Incorporating a variety of colorful vegetables into your meals provides a rich spectrum of vitamins and antioxidants to boost immunity.",
  "A calm mind supports a healthy body. Dedicating just 5 minutes to quiet meditation can help reduce daily stress and lower cortisol levels.",
  "Remember that physical health and mental wellness go hand in hand. Make time today for an activity that brings you genuine joy.",
  "Opting for whole grains over refined carbohydrates provides sustained energy release and supports healthy digestion.",
  "A brisk walk in the morning sunlight helps set your sleep-wake cycle and naturally boosts your mood and Vitamin D levels.",
  "Listen to your body. Rest is just as productive as activity when it comes to maintaining long-term wellness and preventing burnout.",
  "Replacing sugary drinks with herbal teas or infused water is an excellent step toward reducing empty calories and staying refreshed.",
  "Small, daily steps lead to big, long-term changes. Focus on making one positive health choice at a time.",
  "Practicing box breathing (inhaling, holding, exhaling, and holding for equal counts) is a fast way to reset during busy moments.",
  "Keeping a positive mindset and celebrating small milestones in your wellness journey helps build lasting motivation."
];


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
