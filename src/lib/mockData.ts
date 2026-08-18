// ====================================================================
// MEDIMZ MOCK DATA & SCHEDULERS
// ====================================================================

export interface Profile {
  id: string;
  fullName: string;
  avatarUrl: string;
  age: number;
  gender: string;
  medicalConditions: string[];
  nickname?: string;
  dob?: string;
  bloodGroup?: string;
  phone_number?: string;
  addresses: {
    id: string;
    label: string;
    line1: string;
    area: string;
    city: string;
    pincode: string;
  }[];
  role: "user" | "admin";
  familyId?: string | null;
  email?: string;
  isWalkthroughShown?: boolean;           
  isMedicineWalkthroughShown?: boolean;     
  isPrescriptionWalkthroughShown?: boolean; 
  isSignupDone?: boolean; 
}

export interface FamilyMember {
  id: string;
  name: string;
  avatarUrl: string;
  relationship: string;
  age: number;
  gender: string;
  medicalConditions: string[];
  adherenceRate?: number;
  nickname?: string;
  dob?: string;
  bloodGroup?: string;
  phone?: string;
  medicalNotes?: string;
  allergies?: string[];
  existingDiseases?: string[];
  color?: string; // blue, green, purple, orange, pink, teal, grey
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  frequency: "daily" | "weekly" | "every_day" | "specific_days" | "interval";
  timings: ("morning" | "afternoon" | "evening" | "night")[];
  startDate: string;
  endDate?: string;
  intakeTimes?: string[];
  stockCount?: number;
  isPrivate?: boolean;
}

export interface Reminder {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  instructions: string;
  familyMemberId?: string | null; // null if for the user themselves
  familyMemberName?: string;
  scheduledTime: string; // ISO String
  timingSlot: "morning" | "afternoon" | "evening" | "night";
  status: "pending" | "taken" | "missed";
  takenAt?: string;
  recipientNickname?: string;
  recipientAvatar?: string;
  recipientColor?: string;
  intakeTime?: string;
  snoozedUntil?: string;
  isPrivate?: boolean;
}

export interface Lab {
  id: string;
  name: string;
  rating: number;
  logoUrl: string;
  coverUrl: string;
  distanceKms: number;
  fastCollectionMins: number;
  isVerified: boolean;
  featuredTest?: string;
}

export interface DiagnosticTest {
  id: string;
  labId: string;
  name: string;
  parametersCount: number;
  originalPrice: number;
  discountedPrice: number;
  description: string;
}

export interface Booking {
  id: string;
  labId: string;
  labName: string;
  testNames: string[];
  bookingDate: string;
  timeSlot: string;
  address: {
    label: string;
    line1: string;
    area: string;
    city: string;
    pincode: string;
  };
  status: "pending" | "assigned" | "out_for_collection" | "collected" | "processing" | "completed" | "cancelled";
  phlebotomistName?: string;
  phlebotomistRating?: number;
  phlebotomistPhone?: string;
  phlebotomistAvatar?: string;
  createdAt: string;
  type?: "lab" | "medicine";
  patientName?: string;
}

export interface HealthReport {
  id: string;
  testName: string;
  fileUrl: string;
  aiSummary: string;
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "reminder" | "booking" | "system";
  isRead: boolean;
  createdAt: string;
}

// 1. DEFAULT USER PROFILE (Sarah)
export const DEFAULT_PROFILE: Profile = {
  id: "sarah-uid-12345",
  fullName: "Sarah D'Souza",
  avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=Sarah&radius=50",
  age: 68,
  gender: "Female",
  medicalConditions: ["Hypertension", "Pre-Diabetes", "High Cholesterol"],
  addresses: [
    {
      id: "addr-1",
      label: "Home",
      line1: "Apt 402, Lotus Heights",
      area: "Koregaon Park, Ghorpadi Road",
      city: "Pune",
      pincode: "411001",
    },
    {
      id: "addr-2",
      label: "Office",
      line1: "Bldg 3, WeWork Commerzone",
      area: "Yerwada",
      city: "Pune",
      pincode: "411006",
    }
  ],
  role: "admin" // Starting as admin to showcase both flows instantly
};

// 2. FAMILY MEMBERS
export const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: "fam-dad",
    name: "Thomas (Dad)",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkU8i9Lq3bGWr_gyDid6MHptiRdALusFWJacyTBDwFk98NP8UfNsu0MGecDeXDagGYkAVNJhTZfEp-Gv1x_bVbtSj2dVv0xUU9OwCmPSYnQbaxgnusgqJnP1HMJj0fBwRbF_5HLdvsU3LUkMnCK2shLXWctt_QqvC4YOm86HJTJ7gY7kG8SQCh479Rd3bmQk8LlwmLSTcrdTFAPegqZs35k-cGZmaeNMBx8qSy1gGC888xMtPD-mYHom9qgTGynlPH9PPb1m6TT8A",
    relationship: "Dad",
    age: 72,
    gender: "Male",
    medicalConditions: ["Ischemic Heart Disease", "Mild Arthritis"],
    adherenceRate: 92
  },
  {
    id: "fam-mom",
    name: "Mary (Mom)",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiKYUATWdykomgbi2eJTBR6Pu4Fb0lX2L0QO2xpD9iK6DDIoZuy2aWI_dlQCcjmmEqAcVxa0kJxEe2IlFXx7B2xEr2X4OAP5S6Ys_6E_Yqk5yYhc--YzuahcPnqL4m53Wd8zViOFrWaqOP1nByAflvZWRa0ZbEYD6hSHS4dDLTj5V-HWj4JFlGPxQ-o9Iz4ZgHqySH8RzHKie9k27PamKVpWsdNEP8kVqyzJ36by-aHGJO3rmH2_He0GKBcWvFdC8GxFHhZCtL7QM",
    relationship: "Mom",
    age: 66,
    gender: "Female",
    medicalConditions: ["Thyroid Disorder", "Osteoporosis"],
    adherenceRate: 85
  }
];

// 3. SEED MEDICINES
export const DEFAULT_MEDICINES: Medicine[] = [
  { id: "med-1", name: "Atorvastatin", dosage: "10mg", instructions: "After breakfast", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-2", name: "Metformin", dosage: "500mg", instructions: "During Lunch", frequency: "daily", timings: ["afternoon"], startDate: "2026-05-01" },
  { id: "med-3", name: "Lisinopril", dosage: "20mg", instructions: "Before Sleep", frequency: "daily", timings: ["night"], startDate: "2026-05-01" },
  { id: "med-4", name: "Paracetamol (Calpol)", dosage: "650mg", instructions: "After Food", frequency: "daily", timings: ["afternoon"], startDate: "2026-05-01" },
  { id: "med-5", name: "Ibuprofen (Brufen)", dosage: "400mg", instructions: "After Food", frequency: "daily", timings: ["evening"], startDate: "2026-05-01" },
  { id: "med-6", name: "Amoxicillin", dosage: "500mg", instructions: "After Food", frequency: "daily", timings: ["morning", "night"], startDate: "2026-05-01" },
  { id: "med-7", name: "Cetirizine (Alerid)", dosage: "10mg", instructions: "Before Sleep", frequency: "daily", timings: ["night"], startDate: "2026-05-01" },
  { id: "med-8", name: "Omeprazole", dosage: "20mg", instructions: "Empty Stomach", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-9", name: "Amlodipine", dosage: "5mg", instructions: "After breakfast", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-10", name: "Losartan", dosage: "50mg", instructions: "Before Sleep", frequency: "daily", timings: ["night"], startDate: "2026-05-01" },
  { id: "med-11", name: "Levothyroxine", dosage: "75mcg", instructions: "Empty Stomach", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-12", name: "Gabapentin", dosage: "300mg", instructions: "Before Sleep", frequency: "daily", timings: ["night"], startDate: "2026-05-01" },
  { id: "med-13", name: "Metoprolol", dosage: "25mg", instructions: "After breakfast", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-14", name: "Pantoprazole (Pan-D)", dosage: "40mg", instructions: "Empty Stomach", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-15", name: "Azithromycin", dosage: "500mg", instructions: "Before Food", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-16", name: "Simvastatin", dosage: "20mg", instructions: "Before Sleep", frequency: "daily", timings: ["night"], startDate: "2026-05-01" },
  { id: "med-17", name: "Sertraline", dosage: "50mg", instructions: "After Food", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-18", name: "Montelukast", dosage: "10mg", instructions: "Before Sleep", frequency: "daily", timings: ["night"], startDate: "2026-05-01" },
  { id: "med-19", name: "Alprazolam (Xanax)", dosage: "0.25mg", instructions: "Before Sleep", frequency: "daily", timings: ["night"], startDate: "2026-05-01" },
  { id: "med-20", name: "Aspirin (Ecosprin)", dosage: "75mg", instructions: "After Food", frequency: "daily", timings: ["afternoon"], startDate: "2026-05-01" },
  { id: "med-21", name: "Vitamin D3", dosage: "60k UI", instructions: "Weekly with Milk", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-22", name: "Folic Acid", dosage: "5mg", instructions: "After Food", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-23", name: "Ranitidine (Rantac)", dosage: "150mg", instructions: "Empty Stomach", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-24", name: "Clopidogrel", dosage: "75mg", instructions: "After Food", frequency: "daily", timings: ["afternoon"], startDate: "2026-05-01" },
  { id: "med-25", name: "Prednisolone", dosage: "5mg", instructions: "After Food", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-26", name: "Ciprofloxacin", dosage: "500mg", instructions: "After Food", frequency: "daily", timings: ["morning", "night"], startDate: "2026-05-01" },
  { id: "med-27", name: "Rosuvastatin", dosage: "10mg", instructions: "Before Sleep", frequency: "daily", timings: ["night"], startDate: "2026-05-01" },
  { id: "med-28", name: "Telmisartan", dosage: "40mg", instructions: "After breakfast", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-29", name: "Duloxetine", dosage: "30mg", instructions: "After Food", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" },
  { id: "med-30", name: "Spironolactone", dosage: "25mg", instructions: "After Food", frequency: "daily", timings: ["morning"], startDate: "2026-05-01" }
];

// 4. PRE-GENERATED REMINDERS (logs for consistency visualization)
export const generateDefaultReminders = (): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();

  // Set times for today's slots
  const morningTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30).toISOString();
  const afternoonTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0).toISOString();
  const nightTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 21, 30).toISOString();

  // Reminders for today: Atorvastatin (morning, Taken), Metformin (afternoon, Pending), Lisinopril (night, Pending)
  reminders.push({
    id: "rem-today-1",
    medicineId: "med-1",
    medicineName: "Atorvastatin",
    dosage: "10mg",
    instructions: "After breakfast",
    scheduledTime: morningTime,
    timingSlot: "morning",
    status: "taken",
    takenAt: morningTime
  });

  reminders.push({
    id: "rem-today-2",
    medicineId: "med-2",
    medicineName: "Metformin",
    dosage: "500mg",
    instructions: "During Lunch",
    scheduledTime: afternoonTime,
    timingSlot: "afternoon",
    status: "pending"
  });

  reminders.push({
    id: "rem-today-3",
    medicineId: "med-3",
    medicineName: "Lisinopril",
    dosage: "20mg",
    instructions: "Before Sleep",
    scheduledTime: nightTime,
    timingSlot: "night",
    status: "pending"
  });

  // Adding some reminders for Dad (Thomas) to show Family Sync items
  reminders.push({
    id: "rem-dad-today",
    medicineId: "med-dad-1",
    medicineName: "Aspirin",
    dosage: "75mg",
    instructions: "After dinner",
    familyMemberId: "fam-dad",
    familyMemberName: "Thomas (Dad)",
    scheduledTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0).toISOString(),
    timingSlot: "evening",
    status: "pending"
  });

  // Reminders for past 3 days (for streak calculations)
  for (let i = 1; i <= 3; i++) {
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - i);

    const mTime = new Date(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate(), 8, 30).toISOString();
    const aTime = new Date(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate(), 13, 0).toISOString();
    const nTime = new Date(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate(), 21, 30).toISOString();

    // Past reminders were all taken (perfect consistency)
    reminders.push({
      id: `rem-past-${i}-1`,
      medicineId: "med-1",
      medicineName: "Atorvastatin",
      dosage: "10mg",
      instructions: "After breakfast",
      scheduledTime: mTime,
      timingSlot: "morning",
      status: "taken",
      takenAt: mTime
    });

    reminders.push({
      id: `rem-past-${i}-2`,
      medicineId: "med-2",
      medicineName: "Metformin",
      dosage: "500mg",
      instructions: "During Lunch",
      scheduledTime: aTime,
      timingSlot: "afternoon",
      status: "taken",
      takenAt: aTime
    });

    reminders.push({
      id: `rem-past-${i}-3`,
      medicineId: "med-3",
      medicineName: "Lisinopril",
      dosage: "20mg",
      instructions: "Before Sleep",
      scheduledTime: nTime,
      timingSlot: "night",
      status: "taken",
      takenAt: nTime
    });
  }

  return reminders;
};

// 5. LABS SEED
export const DEFAULT_LABS: Lab[] = [
  {
    id: "lab-apollo",
    name: "Apollo Diagnostics",
    rating: 4.8,
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCs_YGgPk7VOsahsNOdDGaNvTVuV8ZJljMuiD4GSAvQV802koXWwDy1aqg24M8w4jkBOlONbu5i26SUif3gi5LPSJdJTIsezyMH8110SLHE0ozw3THzKTDYhaQlyt_VIlwWfdWx77zbAiEOLAL3ECuPW_nczo2q_K6P86C1sjYXaGLJLM7Yat-hklQsSRx-W2cQpIVZeYlZa67VQOAjruHo1PoamPN_KE5vR8VC_KszfJWHF",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvcmj8o4pq3x_7g_JX33Ic4GuIzT5LPZTwmIypmZ8ZpDWtRXf-52842flnbDjQ8G3V2xjiAaFHQGwjYr3ntUHtrWGaG8eJjprUTiUCxQhaxcqoWHYKZOD_g9fOBNBEbTQxCqndd_SRrt8tiiETqufqdP0bE9GOAJPGgjrtvu12ssE3DhmR2oOxie_qVCpDt6EmBpsEByNQe17-yWunH3a4RLQM-SJWVOiVD-yqUvlQeo4yZ3RFlFwsqZPfcHCik9fjHYP5SIxuAZ8",
    distanceKms: 2.4,
    fastCollectionMins: 60,
    isVerified: true,
    featuredTest: "Full Body Shield"
  },
  {
    id: "lab-lal",
    name: "Dr. Lal PathLabs",
    rating: 4.5,
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0iDNGMcd-Lts-dn-h4UgIexcW50Y0EnjHORC2WVhxS7KeL-OM2OwSEy12MGvUR7nWZDBxH0YHuAeBb4o00LVrT",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0iDNGMcd-Lts-dn-h4UgIexcW50Y0EnjHORC2WVhxS7KeL-OM2OwSEy12MGvUR7nWZDBxH0YHuAeBb4o00LVrTAWcuFb6OcyuiEwTsi4HlpOTanj8LAEnmm0VDwY3jj2nc7AF1cHqfm2z6YzCbTMn7NgxffcLfJLiPv-Gu9vVHd1VIUztdRr-KylKlfPvRqCPzAkb-wuRvfLT6eZyJAZ3vBwyfxRx8WbHmOvspIuBwJPavavtR_jjXN8TWVpI1p28U226y7WtsM0",
    distanceKms: 0.8,
    fastCollectionMins: 90,
    isVerified: true,
    featuredTest: "Diabetes Panel"
  },
  {
    id: "lab-medimz",
    name: "Medimz Labs & Care",
    rating: 4.9,
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCs_YGgPk7VOsahsNOdDGaNvTVuV8ZJljMuiD4GSAvQV802koXWwDy1aqg24M8w4jkBOlONbu5i26SUif3gi5LPSJdJTIs",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn18SqB1MxkHYi2U2uZ-pnQy11RQM3tcnP_gvaStsDj02fCNmPAFTacl9x87eapxMg1euf95r7ehgp1Q6f2F-hBToSHx_cjNvDVvCk6Xcg0nal9AMCZpc1wZkIFlTkYSx7bqh4_FFv0HJTKNTCzQrO_ZnrQqlyUiKVvxv4G2klfDAAbL_Bbq8hP-m0dZzfYsiey3V-aiXlLx4uKUnY7cuLCjAHIOlZK2eZdx1MWE3WwGsb14OU_njufkuvOMDfHU7ic4DjvJBo-oE",
    distanceKms: 1.2,
    fastCollectionMins: 45,
    isVerified: true,
    featuredTest: "Metabolic Pulse Check"
  }
];

// 6. TESTS SEED
export const DEFAULT_TESTS: DiagnosticTest[] = [
  // Apollo Tests
  {
    id: "test-cbc-apollo",
    labId: "lab-apollo",
    name: "Complete Blood Count (CBC)",
    parametersCount: 24,
    originalPrice: 499,
    discountedPrice: 349,
    description: "Evaluates overall health and detects a wide range of disorders, including anemia, infection, and leukemia."
  },
  {
    id: "test-lipid-apollo",
    labId: "lab-apollo",
    name: "Lipid Profile (Cholesterol Check)",
    parametersCount: 8,
    originalPrice: 899,
    discountedPrice: 599,
    description: "Measures cholesterol levels to determine cardiac risks and lipid imbalances."
  },
  {
    id: "test-fbs-apollo",
    labId: "lab-apollo",
    name: "Fasting Blood Sugar (FBS)",
    parametersCount: 1,
    originalPrice: 199,
    discountedPrice: 99,
    description: "Measures the glucose level in your blood after fasting overnight to diagnose pre-diabetes and diabetes."
  },
  {
    id: "test-full-body-apollo",
    labId: "lab-apollo",
    name: "Full Body Shield Checkup",
    parametersCount: 84,
    originalPrice: 2499,
    discountedPrice: 1299,
    description: "Comprehensive panel checking Liver, Kidney, Thyroid, Vitals, Blood cells, Cholesterol, and Diabetes factors."
  },

  // Dr Lal Tests
  {
    id: "test-hba1c-lal",
    labId: "lab-lal",
    name: "HbA1c (Average Glucose)",
    parametersCount: 2,
    originalPrice: 600,
    discountedPrice: 450,
    description: "Gives a 3-month average of blood sugar levels, critical for tracking diabetic control."
  },
  {
    id: "test-thyroid-lal",
    labId: "lab-lal",
    name: "Thyroid Profile (T3, T4, TSH)",
    parametersCount: 3,
    originalPrice: 799,
    discountedPrice: 499,
    description: "Assesses thyroid hormone function, essential for weight, fatigue, and energy regulation."
  },
  {
    id: "test-vit-d3-lal",
    labId: "lab-lal",
    name: "Vitamin D3 Check",
    parametersCount: 1,
    originalPrice: 1200,
    discountedPrice: 799,
    description: "Checks levels of Vitamin D, essential for bone structure, calcium regulation, and general immune function."
  },

  // Medimz Tests
  {
    id: "test-metabolic-medimz",
    labId: "lab-medimz",
    name: "Metabolic Pulse Check",
    parametersCount: 12,
    originalPrice: 1500,
    discountedPrice: 899,
    description: "A fast, smart check of metabolic indicators including lipids, glucose, and cortisol markers."
  }
];

// 7. BOOKINGS INITIAL
export const DEFAULT_BOOKINGS = (): Booking[] => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  return [
    {
      id: "ord-9021",
      labId: "lab-apollo",
      labName: "Apollo Diagnostics",
      testNames: ["Complete Blood Count (CBC)"],
      bookingDate: today.toISOString().split("T")[0],
      timeSlot: "08:30 AM - 09:30 AM",
      address: {
        label: "Home",
        line1: "Apt 402, Lotus Heights",
        area: "Koregaon Park, Ghorpadi Road",
        city: "Pune",
        pincode: "411001"
      },
      status: "out_for_collection",
      phlebotomistName: "Dr. Rajesh Kumar",
      phlebotomistRating: 4.9,
      phlebotomistPhone: "+91 98765 43210",
      phlebotomistAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNNZkMGj4I60pe8WPNWMe2lV2_-hCv1uaYCkAmsEDa1V0oauJkDG6W9CbSFNwGkN39oHcwQ8Gf0GBySyYTPXiO7_rbZrE-3qLk7eYJOFj4dqC6nVjckMqxr_n6CVVnRU--0fkAbKxuSRbe-QANE62TtQVIQ7_MFKDs7JZh6J2o7KRcAtHFlYIJCEfdcoxdRQlo3QDeFjURYDZfrVkL31ABDyPhF_VUmsn6isYDSO4hCLEzu8nqwMc9vDexa5YM4yz3RBSSbabbtTI",
      createdAt: today.toISOString()
    },
    {
      id: "ord-9022",
      labId: "lab-lal",
      labName: "Dr. Lal PathLabs",
      testNames: ["HbA1c (Average Glucose)", "Thyroid Profile (T3, T4, TSH)"],
      bookingDate: tomorrow.toISOString().split("T")[0],
      timeSlot: "07:30 AM - 08:30 AM",
      address: {
        label: "Home",
        line1: "Apt 402, Lotus Heights",
        area: "Koregaon Park, Ghorpadi Road",
        city: "Pune",
        pincode: "411001"
      },
      status: "assigned",
      phlebotomistName: "Aman Sharma",
      phlebotomistRating: 4.7,
      phlebotomistPhone: "+91 91234 56789",
      phlebotomistAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-fiijosOOELks0G1tPoJE1MwOmluzSSwm9TEMIKcSMP21iAdVQkAz9HzvlZz_bMc9BAGFfm9eicDCBgBKlTZP6xA2M5YuPjf8kBHQXlAUMDCUFmgw6CwcZ5z4CUrLxxocC1utmx6t299A3bLTh3QfPRnX8rBnBia6B_YosJzdoBQ3em3MAveGI-y_MFhviEicCv2Zo9gtHVKAzJ4beOQSiDimbElcfX9XLdCNUHeC9gJDjfT65xTalzDi_Dea6iy-YWtbxGTSSCs",
      createdAt: today.toISOString()
    }
  ];
};

// 8. HEALTH REPORTS INITIAL
export const DEFAULT_REPORTS: HealthReport[] = [
  {
    id: "rep-1",
    testName: "Lipid Profile Summary",
    fileUrl: "/reports/lipid_oct_25.pdf",
    aiSummary: "Your total cholesterol is down to 198 mg/dL (optimal) from 220 mg/dL last month. HDL (Good cholesterol) showed an 8% increase. This correlates perfectly with your Atorvastatin compliance streaks.",
    date: "2026-04-20"
  },
  {
    id: "rep-2",
    testName: "Complete Blood Count",
    fileUrl: "/reports/cbc_march_15.pdf",
    aiSummary: "All red and white blood cell levels are in the normal physiologic range. Platelet levels are stabilized. General oxygen carrying capacity remains healthy.",
    date: "2026-03-15"
  }
];

// 9. NOTIFICATIONS INITIAL
export const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "Morning Medicine Reminder 💙",
    message: "Time for your Atorvastatin 10mg. Remember to take it after breakfast.",
    type: "reminder",
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "notif-2",
    title: "Phlebotomist assigned!",
    message: "Dr. Rajesh Kumar is assigned to collect your CBC blood sample today at Koregaon Park.",
    type: "booking",
    isRead: true,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "notif-3",
    title: "Phenomenal consistency! 🚀",
    message: "You've stabilised your evening routine with a 7-day adherence streak. Excellent work!",
    type: "system",
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

export const TermsConditions = `https://medimz.com/terms`