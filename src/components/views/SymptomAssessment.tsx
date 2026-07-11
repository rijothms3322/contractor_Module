"use client";

import React, { useState, useEffect } from "react";

// EXTENSIVE CONDITIONS & SYMPTOMS DATABASE
interface Condition {
  name: string;
  category: string;
  possibility: "Low" | "Medium" | "High";
  explanation: string;
  matchReason: string;
  typicalSymptoms: string[];
  causes: string[];
  nextSteps: string;
  selfCare?: string;
  emergencySignals: string;
  labs: string[];
}

const CONDITIONS_DATABASE: Condition[] = [
  {
    name: "Common Cold",
    category: "Respiratory",
    possibility: "High",
    explanation: "A mild, self-limiting viral infection of your upper respiratory tract.",
    matchReason: "Matches your reported symptoms of runny nose, mild congestion, and low-grade temperature.",
    typicalSymptoms: ["Runny nose", "Sneezing", "Sore throat", "Mild cough", "Low-grade fever"],
    causes: ["Rhinovirus", "Coronavirus", "Spread via airborne droplets"],
    nextSteps: "Rest, stay hydrated, and monitor symptoms. Consult a pharmacist for OTC symptomatic relief.",
    selfCare: "Warm saline gargles, steam inhalation, and hot fluids.",
    emergencySignals: "High fever (>102°F) lasting over 3 days or difficulty breathing.",
    labs: ["Complete Blood Count (CBC)"]
  },
  {
    name: "Influenza (Flu)",
    category: "Respiratory",
    possibility: "Medium",
    explanation: "A highly contagious viral infection that attacks the respiratory system.",
    matchReason: "Matches your abrupt onset of high fever, body pain, chills, and fatigue.",
    typicalSymptoms: ["High fever", "Severe body pain", "Chills", "Fatigue", "Dry cough", "Headache"],
    causes: ["Influenza viruses (Type A and B)"],
    nextSteps: "Consult a healthcare provider within 48 hours for potential antiviral prescription.",
    selfCare: "Absolute bed rest, high hydration, and acetaminophen for fever/aches.",
    emergencySignals: "Shortness of breath, chest pain, or sudden dizziness.",
    labs: ["Complete Blood Count (CBC)", "COVID-19/Flu Panel Test"]
  },
  {
    name: "Migraine",
    category: "Neurological",
    possibility: "Medium",
    explanation: "A neurological condition characterized by intense, throbbing headaches.",
    matchReason: "Matches your one-sided head pain, light sensitivity, and nausea.",
    typicalSymptoms: ["One-sided throbbing pain", "Nausea", "Sensitivity to light/sound", "Visual aura"],
    causes: ["Genetic factors", "Hormonal changes", "Stress, lack of sleep, or diet triggers"],
    nextSteps: "Consult a neurologist if headaches are frequent. Keep a headache diary.",
    selfCare: "Rest in a quiet, dark room. Apply a cold compress to your forehead.",
    emergencySignals: "Sudden onset of 'thunderclap' headache or headache accompanied by numbness/speech difficulties.",
    labs: ["ECG (to rule out cardiovascular headache triggers)"]
  },
  {
    name: "Gastroesophageal Reflux Disease (GERD)",
    category: "Digestive",
    possibility: "Medium",
    explanation: "A chronic digestive disease where stomach acid flows back into the food pipe.",
    matchReason: "Matches your complaints of upper abdominal center pain, acidity, and post-meal discomfort.",
    typicalSymptoms: ["Heartburn", "Acid regurgitation", "Chest discomfort after eating", "Bloating"],
    causes: ["Weak lower esophageal sphincter", "Hiatal hernia", "Spicy/fatty foods, lying down post meals"],
    nextSteps: "Consult a gastroenterologist if symptoms occur more than twice a week.",
    selfCare: "Eat smaller meals, avoid lying down for 3 hours after eating, and elevate the head of your bed.",
    emergencySignals: "Difficulty swallowing, choking sensation, or black stools.",
    labs: ["Urine Routine (to rule out UTI mimicking abdominal pain)"]
  },
  {
    name: "Allergic Rhinitis",
    category: "Respiratory",
    possibility: "High",
    explanation: "An allergic response causing itchy eyes, sneezing, and runny nose.",
    matchReason: "Corresponds to your watery nose and sneezing cycles without fever.",
    typicalSymptoms: ["Sneezing", "Runny nose", "Itchy eyes", "Nasal congestion"],
    causes: ["Pollen, dust mites, pet dander, mold spores"],
    nextSteps: "Identify triggers. Consult an allergist or pharmacist for antihistamines.",
    selfCare: "Keep windows closed during high pollen seasons. Use saline nasal rinses.",
    emergencySignals: "Swelling of the lips, tongue, or difficulty breathing (indicates anaphylaxis).",
    labs: ["Complete Blood Count (CBC)"]
  }
];

const SUGGESTED_SYMPTOMS = [
  "Fever", "Headache", "Cough", "Stomach Pain", "Vomiting", "Chest Pain", 
  "Dizziness", "Runny nose", "Body pain", "Chills", "Nausea", "Light sensitivity",
  "Upper abdominal pain", "Shortness of breath", "Fatigue", "Sore throat", "Diarrhea"
];

const EMERGENCY_RED_FLAGS = [
  "chest pain",
  "difficulty breathing",
  "one-sided weakness",
  "sudden confusion",
  "severe allergic reaction",
  "loss of consciousness",
  "vomiting blood",
  "blood in stool",
  "severe abdominal pain",
  "pregnancy with bleeding",
  "high fever in infants",
  "suicidal thoughts",
  "paralysis",
  "heavy bleeding"
];

// Helper for local storage safety
const getSavedAssessments = (): any[] => {
  try {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("medimz_assessments");
      return data ? JSON.parse(data) : [];
    }
  } catch (e) {
    console.warn("Failed to load assessments from localStorage:", e);
  }
  return [];
};

const saveAssessments = (assessments: any[]) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("medimz_assessments", JSON.stringify(assessments));
    }
  } catch (e) {
    console.warn("Failed to save assessments to localStorage:", e);
  }
};

export const SymptomAssessment: React.FC = () => {
  // Navigation & Flow
  const [step, setStep] = useState<"intro" | "disclaimer" | "profile" | "search" | "refine" | "result" | "history">("intro");
  
  // Assessment State
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [age, setAge] = useState("28");
  const [gender, setGender] = useState("female");
  const [height, setHeight] = useState("165");
  const [weight, setWeight] = useState("60");
  const [pregnant, setPregnant] = useState("No");
  const [chronics, setChronics] = useState<string[]>([]);
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [smoking, setSmoking] = useState("No");
  const [alcohol, setAlcohol] = useState("No");

  // Symptoms Selection
  const [symptomInput, setSymptomInput] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [refinementQuestions, setRefinementQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // History & Timelines
  const [savedHistory, setSavedHistory] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [photoAttached, setPhotoAttached] = useState<string | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);

  // Error/Emergency States
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [emergencyBooked, setEmergencyBooked] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState(300);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emergencyBooked && emergencyCountdown > 0) {
      timer = setInterval(() => {
        setEmergencyCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emergencyBooked, emergencyCountdown]);

  const formatCountdown = () => {
    const mins = Math.floor(emergencyCountdown / 60);
    const secs = emergencyCountdown % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  useEffect(() => {
    setSavedHistory(getSavedAssessments());
  }, []);

  // Sync autocomplete suggestions
  const handleInputChange = (val: string) => {
    setSymptomInput(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = SUGGESTED_SYMPTOMS.filter(
      (s) => s.toLowerCase().includes(val.toLowerCase()) && !selectedSymptoms.includes(s)
    );
    setSuggestions(filtered);
  };

  // Add symptom selection
  const addSymptom = (symptom: string) => {
    const updated = [...selectedSymptoms, symptom];
    setSelectedSymptoms(updated);
    setSymptomInput("");
    setSuggestions([]);

    // Check emergency red flags immediately
    const isRedFlag = EMERGENCY_RED_FLAGS.some(
      (flag) => symptom.toLowerCase().includes(flag) || flag.includes(symptom.toLowerCase())
    );
    if (isRedFlag) {
      setEmergencyTriggered(true);
    }
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
  };

  // Build dynamic follow-up questions
  const generateQuestions = () => {
    const questions: any[] = [];
    const hasFever = selectedSymptoms.includes("Fever");
    const hasHeadache = selectedSymptoms.includes("Headache");
    const hasStomach = selectedSymptoms.includes("Stomach Pain") || selectedSymptoms.includes("Upper abdominal pain");

    if (hasFever) {
      questions.push({
        id: "fever_duration",
        question: "When did your fever start?",
        options: ["Today", "Yesterday", "2–3 Days", "More than 1 Week"]
      });
      questions.push({
        id: "fever_temp",
        question: "What is your body temperature level?",
        options: ["Unknown", "Below 100°F", "100–102°F", "Above 102°F"]
      });
      questions.push({
        id: "fever_chills",
        question: "Are you experiencing chills?",
        options: ["Yes", "No"]
      });
      questions.push({
        id: "fever_cough",
        question: "Do you have a cough?",
        options: ["Dry", "Wet", "No"]
      });
    }

    if (hasHeadache) {
      questions.push({
        id: "headache_location",
        question: "Where is the head pain located?",
        options: ["Front", "Back", "One side", "Whole head"]
      });
      questions.push({
        id: "headache_intensity",
        question: "Pain Intensity (1 - 10)?",
        options: ["Mild (1-3)", "Moderate (4-6)", "Severe (7-10)"]
      });
      questions.push({
        id: "headache_nausea",
        question: "Are you feeling nauseous or vomiting?",
        options: ["Yes", "No"]
      });
    }

    if (hasStomach) {
      questions.push({
        id: "stomach_location",
        question: "Where is the abdominal pain located?",
        options: ["Upper Center", "Lower Right", "Lower Left", "Whole Abdomen"]
      });
      questions.push({
        id: "stomach_symptoms",
        question: "Do you have any of these digestive symptoms?",
        options: ["Diarrhea", "Vomiting", "Constipation", "None"]
      });
    }

    // Default general question if no match
    if (questions.length === 0) {
      questions.push({
        id: "symptom_progression",
        question: "How have your symptoms changed over the day?",
        options: ["Worsening", "Staying same", "Improving"]
      });
    }

    setRefinementQuestions(questions);
    setAnswers({});
  };

  const handleAnswerSelect = (qid: string, ans: string) => {
    setAnswers(prev => ({ ...prev, [qid]: ans }));
  };

  const handleSaveAssessment = () => {
    const newRecord = {
      id: `assess-${Date.now()}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      age,
      gender,
      symptoms: selectedSymptoms,
      notes,
      photo: photoAttached,
      possibleConditions: CONDITIONS_DATABASE.map(c => ({
        name: c.name,
        possibility: c.possibility
      }))
    };

    const updated = [newRecord, ...savedHistory];
    setSavedHistory(updated);
    saveAssessments(updated);
    setNotes("");
    setPhotoAttached(null);
    setStep("history");
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = savedHistory.filter((item) => item.id !== id);
    setSavedHistory(updated);
    saveAssessments(updated);
    if (selectedHistoryItem?.id === id) {
      setSelectedHistoryItem(null);
    }
  };

  const triggerMockPhotoUpload = () => {
    // Inject a premium diagnostic mock skin rash photo
    setPhotoAttached("https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=150");
  };

  const handleExportPDF = () => {
    alert("Exporting assessment health report to PDF... Saved to your mobile downloads! 📄");
  };

  return (
    <div className="bg-surface-container-low rounded-3xl border border-outline-variant/35 overflow-hidden shadow-md transition-all duration-300">
      
      {/* Intro Dashboard Trigger */}
      {step === "intro" && (
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-primary">
                <span className="material-symbols-outlined !text-[20px] text-[#ee7b4d]">auto_awesome</span>
                <span className="font-label-md text-xs uppercase tracking-wider font-bold text-[#ee7b4d]">Medimz Diagnosis Engine</span>
              </div>
              <h3 className="font-headline-md text-base text-secondary font-bold">Symptom Checker & AI Assessor</h3>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                Understand what might be causing your fatigue, stomach pain, or fever and get direct lab recommendations.
              </p>
            </div>
            <span className="material-symbols-outlined text-4xl text-primary/20">clinical_notes</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setDisclaimerChecked(false);
                setStep("disclaimer");
              }}
              className="py-3 bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-98 transition-all text-xs flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">health_and_safety</span>
              <span>Start Assessment</span>
            </button>
            
            <button
              onClick={() => setStep("history")}
              className="py-3 bg-white text-secondary border border-outline-variant/35 font-bold rounded-xl hover:bg-surface-container-high active:scale-98 transition-all text-xs flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">history</span>
              <span>View History</span>
            </button>
          </div>
        </div>
      )}

      {/* Emergency Consultation Booking Flow */}
      {emergencyTriggered && (
        <div className="p-8 text-center bg-[#ffebeb] text-[#ba1a1a] space-y-6 animate-in fade-in duration-300 rounded-3xl border border-[#ffb4ab]">
          {!emergencyBooked ? (
            <>
              <div className="w-16 h-16 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto shadow-sm">
                <span className="material-symbols-outlined text-3xl font-bold">medical_services</span>
              </div>
              <div className="space-y-3">
                <h4 className="font-headline-md text-base text-secondary font-bold">Emergency Consultation Recommended</h4>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                  Your selected symptoms or red-flag indicators match clinical emergency conditions.
                </p>
                <div className="p-4 bg-white rounded-2xl border border-outline-variant/30 text-left space-y-2">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Urgent Symptoms Checked</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedSymptoms.map((sym) => (
                      <span key={sym} className="bg-error/10 text-error text-[10px] font-bold px-2.5 py-1 rounded-full border border-error/20">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="font-headline-md text-sm text-secondary font-bold pt-2">
                  Would you like to book an immediate emergency video consultation with our on-duty doctor?
                </p>
              </div>
              
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setEmergencyBooked(true);
                    setEmergencyCountdown(300);
                  }}
                  className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl shadow-md hover:opacity-90 active:scale-98 transition-all text-xs flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">video_call</span>
                  <span>Yes, Book Emergency Consultation</span>
                </button>
                <button
                  onClick={() => {
                    setEmergencyTriggered(false);
                    setSelectedSymptoms([]);
                    setStep("intro");
                  }}
                  className="w-full py-3 bg-white text-secondary border border-outline-variant/30 font-bold rounded-xl hover:bg-surface-container-high text-xs transition-all"
                >
                  No, Return to Symptom Checker
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6 py-2 animate-in zoom-in-95 duration-200 text-center">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-primary animate-pulse">video_chat</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] bg-tertiary/10 text-tertiary font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-tertiary/20">
                  Booking Confirmed
                </span>
                <h4 className="font-headline-md text-base text-secondary font-bold">Connecting with On-Duty Doctor</h4>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                  We are assigning a primary care physician to your consultation. Please stay on this screen.
                </p>
                
                <div className="bg-white p-4 rounded-2xl border border-outline-variant/20 shadow-sm mt-4 text-left flex gap-3 items-center">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80"
                    alt="Doctor Avatar"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h5 className="font-label-md text-xs text-secondary font-bold">Dr. Amit Verma (MD, Medicine)</h5>
                    <p className="text-[10px] text-on-surface-variant">Emergency Telehealth Specialist • ⭐ 4.9</p>
                    <p className="text-[10px] text-primary font-bold mt-1">Starting in {formatCountdown()}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setEmergencyTriggered(false);
                    setEmergencyBooked(false);
                    setSelectedSymptoms([]);
                    setStep("intro");
                  }}
                  className="w-full py-3.5 bg-error text-white font-bold rounded-xl text-xs hover:opacity-90 active:scale-98 transition-all"
                >
                  Cancel Consultation & Exit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer Flow */}
      {!emergencyTriggered && step === "disclaimer" && (
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-error">warning</span>
            <h4 className="font-headline-md text-base text-secondary font-bold">Medical Disclaimer</h4>
          </div>
          
          <div className="font-body-md text-xs text-on-surface-variant space-y-3 max-h-60 overflow-y-auto pr-2 leading-relaxed">
            <p className="font-bold text-[#ba1a1a]">
              ⚠️ This Symptom Assessment tool is for educational and informational purposes only.
            </p>
            <p>It is NOT intended to diagnose, treat, cure, or prevent any disease.</p>
            <p>The results are generated based on the symptoms you enter and may not accurately reflect your medical condition.</p>
            <p className="font-semibold text-secondary">
              Always consult a qualified healthcare professional before making medical decisions.
            </p>
            <div className="p-3 bg-surface-container rounded-xl text-[10px] space-y-1.5 border border-outline-variant/25">
              <span className="font-bold text-[#ba1a1a] block">If you experience:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Chest pain or difficulty breathing</li>
                <li>Loss of consciousness or seizures</li>
                <li>Sudden weakness or paralysis</li>
                <li>Heavy uncontrolled bleeding</li>
                <li>Severe allergic reactions</li>
              </ul>
              <span className="font-bold block pt-1 text-secondary">Immediately call your local emergency service (108 / 112).</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={disclaimerChecked}
                onChange={(e) => setDisclaimerChecked(e.target.checked)}
                className="w-5 h-5 rounded border-outline-variant/60 text-primary focus:ring-primary focus:ring-offset-0"
              />
              <span className="font-label-md text-sm text-secondary font-bold">I Understand</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setStep("intro")}
              className="py-3 bg-white text-secondary border border-outline-variant/30 font-bold rounded-xl hover:bg-surface-container-high text-xs transition-all"
            >
              Cancel
            </button>
            <button
              disabled={!disclaimerChecked}
              onClick={() => setStep("profile")}
              className="py-3 bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-98 transition-all text-xs disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 1: User Profile */}
      {!emergencyTriggered && step === "profile" && (
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
            <h4 className="font-headline-md text-base text-secondary font-bold">User Profile</h4>
            <span className="text-[10px] bg-secondary/10 text-secondary font-bold px-2 py-0.5 rounded-full">Step 1 of 3</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Age (Years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {gender === "female" && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Are you pregnant?</label>
              <div className="flex gap-4">
                {["Yes", "No", "Not Applicable"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-xs font-bold text-secondary cursor-pointer">
                    <input
                      type="radio"
                      name="pregnant"
                      value={opt}
                      checked={pregnant === opt}
                      onChange={() => setPregnant(opt)}
                      className="text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Chronic Illnesses Multi Checkboxes */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Chronic Illnesses</label>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-on-surface-variant max-h-32 overflow-y-auto pr-1">
              {["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Thyroid Disorder", "Kidney Disease"].map((ch) => (
                <label key={ch} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chronics.includes(ch)}
                    onChange={(e) => {
                      if (e.target.checked) setChronics([...chronics, ch]);
                      else setChronics(chronics.filter(c => c !== ch));
                    }}
                    className="rounded text-primary focus:ring-primary focus:ring-offset-0 w-4 h-4 border-outline-variant/50"
                  />
                  <span>{ch}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Smoking</label>
              <select
                value={smoking}
                onChange={(e) => setSmoking(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none"
              >
                <option value="No">No</option>
                <option value="Occasional">Occasional</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Alcohol</label>
              <select
                value={alcohol}
                onChange={(e) => setAlcohol(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none"
              >
                <option value="No">No</option>
                <option value="Occasional">Occasional</option>
                <option value="Regular">Regular</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              onClick={() => setStep("disclaimer")}
              className="py-3 bg-white text-secondary border border-outline-variant/30 font-bold rounded-xl hover:bg-surface-container-high text-xs transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStep("search")}
              className="py-3 bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-98 transition-all text-xs"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: What brings you here today? */}
      {!emergencyTriggered && step === "search" && (
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
            <h4 className="font-headline-md text-base text-secondary font-bold">Select Symptoms</h4>
            <span className="text-[10px] bg-secondary/10 text-secondary font-bold px-2 py-0.5 rounded-full">Step 2 of 3</span>
          </div>

          {/* Selected items wrapper */}
          <div className="flex flex-wrap gap-1.5 min-h-8">
            {selectedSymptoms.length === 0 ? (
              <span className="text-[10px] text-outline italic">No symptoms selected yet. Describe below.</span>
            ) : (
              selectedSymptoms.map((sym) => (
                <span
                  key={sym}
                  className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-primary/20 animate-in zoom-in-95 duration-200"
                >
                  <span>{sym}</span>
                  <button onClick={() => removeSymptom(sym)} className="material-symbols-outlined !text-[12px] font-bold hover:text-secondary">close</button>
                </span>
              ))
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline-variant text-lg">search</span>
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Describe your symptoms (e.g. Fever, Headache)..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
            />

            {/* Suggestions Overlay */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-outline-variant/30 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => addSymptom(item)}
                    className="w-full text-left px-4 py-2.5 text-xs text-secondary font-bold hover:bg-surface-container-low transition-all border-b border-outline-variant/10 last:border-b-0"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Common shortcuts */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Common symptoms</span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_SYMPTOMS.slice(0, 7).map((item) => {
                const isSelected = selectedSymptoms.includes(item);
                return (
                  <button
                    key={item}
                    disabled={isSelected}
                    onClick={() => addSymptom(item)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all border ${
                      isSelected
                        ? "bg-surface-container-high border-outline-variant/20 text-outline-variant/60"
                        : "bg-white border-outline-variant/30 text-secondary hover:bg-primary/5 hover:border-primary/30"
                    }`}
                  >
                    + {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              onClick={() => setStep("profile")}
              className="py-3 bg-white text-secondary border border-outline-variant/30 font-bold rounded-xl hover:bg-surface-container-high text-xs transition-all"
            >
              Back
            </button>
            <button
              disabled={selectedSymptoms.length === 0}
              onClick={() => {
                generateQuestions();
                setStep("refine");
              }}
              className="py-3 bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-98 transition-all text-xs disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Symptom Refinement */}
      {!emergencyTriggered && step === "refine" && (
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
            <h4 className="font-headline-md text-base text-secondary font-bold">Refining Symptoms</h4>
            <span className="text-[10px] bg-secondary/10 text-secondary font-bold px-2 py-0.5 rounded-full">Step 3 of 3</span>
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {refinementQuestions.map((q, idx) => (
              <div key={q.id} className="space-y-2 p-3 bg-white border border-outline-variant/20 rounded-2xl">
                <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">Question {idx + 1}</span>
                <p className="font-headline-md text-xs text-secondary font-bold leading-snug">{q.question}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {q.options.map((opt: string) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswerSelect(q.id, opt)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-surface-container hover:bg-surface-container-high border-outline-variant/25 text-secondary"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              onClick={() => setStep("search")}
              className="py-3 bg-white text-secondary border border-outline-variant/30 font-bold rounded-xl hover:bg-surface-container-high text-xs transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStep("result")}
              className="py-3 bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-98 transition-all text-xs"
            >
              Analyze Symptoms
            </button>
          </div>
        </div>
      )}

      {/* Result View */}
      {!emergencyTriggered && step === "result" && (
        <div className="p-6 space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-1.5 text-tertiary">
              <span className="material-symbols-outlined font-bold">check_circle</span>
              <h4 className="font-headline-md text-base text-secondary font-bold">Analysis Results</h4>
            </div>
            <button
              onClick={() => setStep("intro")}
              className="material-symbols-outlined text-outline hover:text-secondary text-lg"
            >
              close
            </button>
          </div>

          {/* Disclaimer Alert */}
          <div className="p-3 bg-primary-container/10 border border-primary-container/20 rounded-2xl flex gap-2.5 items-start">
            <span className="material-symbols-outlined text-primary text-lg">info</span>
            <p className="font-body-md text-[10px] text-on-surface-variant leading-relaxed">
              Based on the symptoms you entered, these conditions may be associated. This is not a diagnosis.
            </p>
          </div>

          {/* Condition Match List */}
          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {CONDITIONS_DATABASE.filter(c => 
              selectedSymptoms.some(s => c.typicalSymptoms.some(ts => ts.toLowerCase().includes(s.toLowerCase())))
            ).map((cond) => (
              <div key={cond.name} className="p-4 bg-white border border-outline-variant/25 rounded-2xl space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <h5 className="font-headline-md text-sm text-secondary font-bold">{cond.name}</h5>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    cond.possibility === "High"
                      ? "bg-error-container text-error"
                      : cond.possibility === "Medium"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary/10 text-secondary"
                  }`}>
                    {cond.possibility} Possibility
                  </span>
                </div>

                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">{cond.explanation}</p>
                
                <div className="p-3 bg-surface-container rounded-xl text-[10px] space-y-1">
                  <span className="font-bold text-secondary block">Matching Reason:</span>
                  <p className="text-on-surface-variant leading-relaxed">{cond.matchReason}</p>
                </div>

                <div className="text-[10px] space-y-1.5">
                  <div>
                    <span className="font-bold text-secondary">Typical Symptoms: </span>
                    <span className="text-on-surface-variant">{cond.typicalSymptoms.join(", ")}</span>
                  </div>
                  <div>
                    <span className="font-bold text-secondary">Next Steps: </span>
                    <span className="text-on-surface-variant">{cond.nextSteps}</span>
                  </div>
                  {cond.selfCare && (
                    <div>
                      <span className="font-bold text-secondary">Self Care advice: </span>
                      <span className="text-on-surface-variant">{cond.selfCare}</span>
                    </div>
                  )}
                </div>

                {/* Lab recommendation card inside each matching condition */}
                <div className="pt-2 border-t border-outline-variant/10 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-outline uppercase font-bold tracking-wider">Suggested Diagnostics</span>
                    <span className="font-label-md text-[10px] text-secondary font-bold block">{cond.labs.join(", ")}</span>
                  </div>
                  <span className="material-symbols-outlined text-primary text-lg">science</span>
                </div>
              </div>
            ))}

            {/* General fallback if zero conditions matched */}
            {CONDITIONS_DATABASE.filter(c => 
              selectedSymptoms.some(s => c.typicalSymptoms.some(ts => ts.toLowerCase().includes(s.toLowerCase())))
            ).length === 0 && (
              <div className="p-6 text-center bg-white border border-outline-variant/25 rounded-2xl">
                <span className="material-symbols-outlined text-3xl text-outline-variant">help_outline</span>
                <p className="font-body-md text-xs text-on-surface-variant mt-2 leading-relaxed">
                  No specific outpatient condition matches your symptom combination. Please monitor symptoms closely and consult a clinician.
                </p>
              </div>
            )}
          </div>

          {/* Medicine and Lab Disclaimer */}
          <div className="p-3 bg-surface-container-low border border-outline-variant/15 rounded-xl text-[9px] text-on-surface-variant/75 leading-relaxed space-y-1">
            <p className="font-bold text-secondary">Supportive Measures Only</p>
            <p>Do not take prescription medicines without direct supervision. Only a qualified healthcare provider can determine which tests are appropriate.</p>
          </div>

          {/* Save & Photo Attachment Timeline Module */}
          <div className="space-y-3 pt-2 border-t border-outline-variant/20">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Timeline Notes</span>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add private health note (e.g. pain duration, foods eaten)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-grow px-3 py-2 bg-white border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              <button
                onClick={triggerMockPhotoUpload}
                className="w-10 h-10 rounded-xl bg-white border border-outline-variant/35 text-secondary flex items-center justify-center hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-lg">
                  {photoAttached ? "check_circle" : "add_a_photo"}
                </span>
              </button>
            </div>

            {photoAttached && (
              <div className="flex gap-2 items-center bg-white p-2 rounded-xl border border-outline-variant/20 animate-in zoom-in-95 duration-200">
                <img src={photoAttached} alt="attached symptom thumbnail" className="w-10 h-10 rounded-lg object-cover" />
                <span className="text-[10px] font-bold text-secondary flex-grow">symptom_rash_scan.jpg</span>
                <button onClick={() => setPhotoAttached(null)} className="material-symbols-outlined text-outline text-base">delete</button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleSaveAssessment}
                className="py-3.5 bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-98 transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                <span>Save to Timeline</span>
              </button>
              <button
                onClick={() => setStep("intro")}
                className="py-3.5 bg-white text-secondary border border-outline-variant/30 font-bold rounded-xl hover:bg-surface-container-high text-xs transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History & Saved Timelines */}
      {!emergencyTriggered && step === "history" && (
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-lg">history</span>
              <h4 className="font-headline-md text-base text-secondary font-bold">Assessment Timeline</h4>
            </div>
            <button
              onClick={() => setStep("intro")}
              className="material-symbols-outlined text-outline hover:text-secondary text-lg"
            >
              close
            </button>
          </div>

          {savedHistory.length === 0 ? (
            <div className="p-8 text-center bg-white border border-outline-variant/20 rounded-2xl flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-4xl text-outline-variant/60">clinical_notes</span>
              <p className="font-body-md text-xs text-on-surface-variant">No saved symptom checker records found.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {savedHistory.map((item) => (
                <div key={item.id} className="p-4 bg-white border border-outline-variant/25 rounded-2xl space-y-3.5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">{item.date}</span>
                      <span className="font-label-md text-xs text-secondary font-bold block mt-0.5">Symptoms: {item.symptoms.join(", ")}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteHistoryItem(item.id)}
                      className="material-symbols-outlined text-outline-variant hover:text-error text-base"
                    >
                      delete
                    </button>
                  </div>

                  {item.notes && (
                    <div className="p-3 bg-surface-container-low rounded-xl text-[10px] border border-outline-variant/15 leading-relaxed text-on-surface-variant">
                      <span className="font-bold text-secondary block">Notes:</span>
                      <p>{item.notes}</p>
                    </div>
                  )}

                  {item.photo && (
                    <div className="flex gap-2 items-center">
                      <img src={item.photo} alt="attached symptom diagnostic" className="w-8 h-8 rounded object-cover" />
                      <span className="text-[9px] text-outline italic">Symptom photo attachment saved</span>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end pt-1">
                    <button
                      onClick={handleExportPDF}
                      className="px-3 py-1.5 bg-surface-container text-secondary rounded-lg font-label-sm text-[10px] font-bold flex items-center gap-1 hover:bg-surface-container-high transition-all"
                    >
                      <span className="material-symbols-outlined text-xs">picture_as_pdf</span>
                      <span>Export PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-outline-variant/10 text-center">
            <button
              onClick={() => {
                setDisclaimerChecked(false);
                setStep("disclaimer");
              }}
              className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl text-xs hover:bg-primary/20 transition-all inline-flex items-center gap-1"
            >
              + New Symptom Assessment
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
