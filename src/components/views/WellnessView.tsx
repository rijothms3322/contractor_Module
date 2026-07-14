"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";

type ViewState = 'dashboard' | 'library' | 'detail' | 'session';

// Extended Exercise Type for the Library
interface Exercise {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  difficulty: string;
  healthBenefit: string;
  icon: string;
  targetFocus: string;
  instructions: string[];
  frequency: string;
  conditionsSupported?: string[];
}

const EXERCISE_LIBRARY: Exercise[] = [
  { id: '1', title: 'Morning Rise Yoga', category: 'Yoga', durationMinutes: 15, difficulty: 'Beginner', healthBenefit: 'Wakes up muscles, improves flexibility and circulation.', icon: 'self_improvement', targetFocus: 'Overall Mobility', instructions: ['Childs Pose (1 min) - Focus on deep breaths', 'Cat-Cow (2 min) - Warm up the spine', 'Downward Dog (2 min) - Stretch hamstrings', 'Sun Salutation (10 min) - Flow through movements gently'], frequency: 'Daily' },
  { id: '2', title: 'Heart-Healthy Walk', category: 'Cardio', durationMinutes: 30, difficulty: 'Beginner', healthBenefit: 'Supports cardiovascular health, aids BP stabilization.', icon: 'directions_walk', targetFocus: 'Heart Health', instructions: ['Warm up pace (5 min) - Easy stroll', 'Brisk pace (20 min) - Elevate heart rate slightly', 'Cool down (5 min) - Return to easy stroll'], frequency: '3-4x Weekly' },
  { id: '3', title: 'Box Breathing', category: 'Breathing Exercises', durationMinutes: 5, difficulty: 'All Levels', healthBenefit: 'Reduces acute stress, lowers heart rate, calms the mind.', icon: 'air', targetFocus: 'Stress Relief', instructions: ['Inhale deeply through nose for 4 seconds', 'Hold breath for 4 seconds', 'Exhale slowly through mouth for 4 seconds', 'Hold empty breath for 4 seconds', 'Repeat cycle for 5 minutes'], frequency: 'As needed' },
  { id: '4', title: 'Joint-Friendly Stretching', category: 'Senior Wellness', durationMinutes: 20, difficulty: 'Beginner', healthBenefit: 'Reduces joint stiffness, improves balance and mobility.', icon: 'accessibility_new', targetFocus: 'Joint Health', instructions: ['Neck rotations - Slow and gentle', 'Shoulder rolls - Forward and backward', 'Seated leg extensions - Strengthen knees', 'Ankle rotations - Improve flexibility'], frequency: 'Daily' },
  { id: '5', title: 'Post-Meal Walk', category: 'Diabetes Support', durationMinutes: 15, difficulty: 'Beginner', healthBenefit: 'Helps regulate post-meal blood sugar spikes.', icon: 'monitor_weight', targetFocus: 'Blood Sugar', instructions: ['Easy walking pace immediately after meals', 'Maintain conversation pace', 'Focus on posture and breathing'], frequency: 'After meals' },
  { id: '6', title: 'Deep Sleep Meditation', category: 'Meditation', durationMinutes: 20, difficulty: 'All Levels', healthBenefit: 'Promotes deep restorative sleep and relaxation.', icon: 'nightlight', targetFocus: 'Sleep Quality', instructions: ['Lie comfortably in bed', 'Body scan from toes to head, relaxing each muscle', 'Focus on breath entering and leaving', 'Allow thoughts to pass without judgment'], frequency: 'Before bed' },
  { id: '7', title: 'Metabolism Boost', category: 'Thyroid Wellness', durationMinutes: 15, difficulty: 'Intermediate', healthBenefit: 'Supports energy levels and metabolic function.', icon: 'vital_signs', targetFocus: 'Energy', instructions: ['Jumping jacks or step jacks (30s)', 'Bodyweight squats (30s)', 'Rest (30s)', 'Repeat circuit 5 times', 'Cool down stretches'], frequency: '3x Weekly' },
  { id: '8', title: 'Mindful Walking', category: 'Walking', durationMinutes: 20, difficulty: 'Beginner', healthBenefit: 'Combines physical activity with mental clarity.', icon: 'nature_people', targetFocus: 'Mental Clarity', instructions: ['Walk at a comfortable pace', 'Notice 5 things you see', 'Notice 4 things you feel', 'Notice 3 things you hear', 'Focus on the rhythm of your steps'], frequency: '2-3x Weekly' },
];

const CATEGORIES = ['All', 'Yoga', 'Cardio', 'Walking', 'Meditation', 'Stretching', 'Breathing Exercises', 'Senior Wellness', 'Diabetes Support', 'BP Wellness', 'Thyroid Wellness'];

export const WellnessView: React.FC<{ hideHero?: boolean }> = ({ hideHero = false }) => {
  const { user, adherenceStreak } = useApp();
  
  const [viewState, setViewState] = useState<ViewState>('dashboard');
  
  // Library State
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // Session State
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);

  // Session Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive && sessionTimeLeft > 0) {
      interval = setInterval(() => {
        setSessionTimeLeft((prev) => {
          const newTime = prev - 1;
          if (selectedExercise) {
            setSessionProgress(((selectedExercise.durationMinutes * 60 - newTime) / (selectedExercise.durationMinutes * 60)) * 100);
          }
          return newTime;
        });
      }, 1000);
    } else if (sessionTimeLeft === 0 && isSessionActive) {
      setIsSessionActive(false);
      setViewState('dashboard');
    }
    return () => clearInterval(interval);
  }, [isSessionActive, sessionTimeLeft, selectedExercise]);

  const handleStartSession = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setSessionTimeLeft(exercise.durationMinutes * 60);
    setSessionProgress(0);
    setIsSessionActive(true);
    setViewState('session');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredExercises = EXERCISE_LIBRARY.filter(ex => 
    (activeCategory === 'All' || ex.category === activeCategory) &&
    ex.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* Hero Wellness AI Banner with Animated Gradients */}
      {!hideHero && (
        <section className="relative overflow-hidden rounded-3xl p-6 shadow-lg border border-white/20 bg-gradient-to-br from-tertiary-container/80 via-surface to-primary-container/40">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-dots-pattern"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-tertiary/20 rounded-full blur-3xl animate-pulse pointer-events-none transform -translate-x-1/2 translate-y-1/2" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-5 items-start w-full">
              <div className="w-14 h-14 rounded-2xl bg-white/40 backdrop-blur-md text-tertiary flex items-center justify-center flex-shrink-0 shadow-sm border border-white/50">
                <span className="material-symbols-outlined text-3xl font-bold">spa</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-headline-md text-xl text-secondary font-bold tracking-tight">Morning, {user?.fullName?.split(" ")[0] || "there"}</h2>
                  <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">auto_awesome</span> AI Sync
                  </span>
                </div>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed opacity-90 max-w-md">
                  "Small daily habits create incredible lifelong health." Let's build your wellness routine today.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Wellness Metrics & Streak System */}
      <section className="grid grid-cols-1 gap-4">
        {/* Action / CTA Card to Library */}
        <div 
          onClick={() => setViewState('library')}
          className="glass-card rounded-3xl p-6 shadow-md border border-tertiary/30 bg-gradient-to-r from-tertiary/10 to-transparent flex flex-col justify-center cursor-pointer group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden relative"
        >
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/20 to-transparent transform translate-x-full group-hover:-translate-x-0 transition-transform duration-700 ease-out"></div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <span className="text-[10px] text-tertiary font-bold uppercase tracking-widest mb-1 block text-left">Explore</span>
              <h3 className="font-headline-md text-xl text-secondary font-black text-left">Exercise Library</h3>
              <p className="text-xs text-on-surface-variant mt-1 text-left">Discover guided routines tailored for you.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined">arrow_forward</span>
            </div>
          </div>
        </div>
      </section>



    </div>
  );

  const renderLibrary = () => (
    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-xl z-20 py-4 -mx-4 px-4 border-b border-outline-variant/10">
        <button 
          onClick={() => setViewState('dashboard')}
          className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="font-headline-md text-xl text-secondary font-black">Exercise Library</h2>
          <p className="text-xs text-on-surface-variant">Tailored for your wellness journey</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            type="text" 
            placeholder="Search exercises, yoga, meditation..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-body-md"
          />
        </div>

        {/* Categories Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 snap-x">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${activeCategory === cat ? 'bg-secondary text-white shadow-md scale-105' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredExercises.map((exercise, idx) => (
          <div 
            key={exercise.id}
            onClick={() => {
              setSelectedExercise(exercise);
              setViewState('detail');
            }}
            className="glass-card rounded-3xl p-5 border border-outline-variant/20 hover:border-tertiary/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center group-hover:bg-tertiary group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-3xl">{exercise.icon}</span>
              </div>
              <span className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider">{exercise.durationMinutes} min</span>
            </div>
            
            <div>
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest block mb-1">{exercise.category}</span>
              <h4 className="font-headline-md text-lg font-bold text-secondary mb-1 leading-tight">{exercise.title}</h4>
              <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 mb-4">{exercise.healthBenefit}</p>
              
              <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/10">
                <div className="flex items-center gap-1.5 text-[10px] text-on-surface font-bold bg-surface-container-low px-2 py-1 rounded-md">
                  <span className="material-symbols-outlined text-[12px] text-outline">fitness_center</span> 
                  {exercise.difficulty}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-on-surface font-bold bg-surface-container-low px-2 py-1 rounded-md">
                  <span className="material-symbols-outlined text-[12px] text-outline">target</span> 
                  {exercise.targetFocus}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredExercises.length === 0 && (
          <div className="col-span-2 text-center py-12 text-outline">
            <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
            <p>No exercises found.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!selectedExercise) return null;
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-500 pb-32">
        
        {/* Header & Hero Image */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br from-tertiary to-secondary aspect-[2/1] sm:aspect-[3/1] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20"></div>
          <button 
            onClick={() => setViewState('library')}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-colors z-10"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          
          <div className="relative z-10 text-center text-white px-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-4xl">{selectedExercise.icon}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest mb-1 block bg-white/20 px-3 py-1 rounded-full inline-block">{selectedExercise.category}</span>
            <h2 className="font-headline-md text-2xl sm:text-3xl font-black mt-2">{selectedExercise.title}</h2>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-outline mb-1 text-xl">timer</span>
            <span className="block font-body-md text-sm text-secondary font-bold">{selectedExercise.durationMinutes} min</span>
            <span className="block font-label-md text-[10px] text-on-surface-variant">Duration</span>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-outline mb-1 text-xl">fitness_center</span>
            <span className="block font-body-md text-sm text-secondary font-bold">{selectedExercise.difficulty}</span>
            <span className="block font-label-md text-[10px] text-on-surface-variant">Level</span>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-outline mb-1 text-xl">event_repeat</span>
            <span className="block font-body-md text-sm text-secondary font-bold">{selectedExercise.frequency}</span>
            <span className="block font-label-md text-[10px] text-on-surface-variant">Frequency</span>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="glass-card rounded-3xl p-6 border border-tertiary/10">
          <h4 className="font-headline-md text-lg text-secondary font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">health_and_safety</span>
            Wellness Benefits
          </h4>
          <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
            {selectedExercise.healthBenefit}
          </p>
        </div>

        {/* Instructions Timeline */}
        <div className="px-2">
          <h4 className="font-headline-md text-lg text-secondary font-bold mb-4">Guided Steps</h4>
          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/30 before:to-transparent">
            {selectedExercise.instructions.map((step, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-surface-container-high text-on-surface-variant text-xs font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 group-hover:bg-tertiary group-hover:text-white transition-colors">
                  {idx + 1}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-4 rounded-2xl border border-outline-variant/10 shadow-sm">
                  <p className="font-body-md text-sm text-on-surface">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Action Button */}
        <div className="fixed bottom-[80px] md:bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent z-30 flex justify-center pointer-events-none">
          <button
            onClick={() => handleStartSession(selectedExercise)}
            className="w-full max-w-md py-4 bg-secondary text-white font-black rounded-2xl text-sm shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 pointer-events-auto"
          >
            <span className="material-symbols-outlined">play_circle</span>
            Start {selectedExercise.durationMinutes}-Min Session
          </button>
        </div>

      </div>
    );
  };

  const renderSession = () => {
    if (!selectedExercise) return null;
    return (
      <div className="fixed inset-0 z-[100] bg-secondary flex flex-col animate-in fade-in zoom-in-95 duration-700 overflow-hidden">
        {/* Ambient Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-tertiary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex justify-between items-center p-6 text-white pt-10">
          <button 
            onClick={() => {
              setIsSessionActive(false);
              setViewState('detail');
            }}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 block">{selectedExercise.category}</span>
            <h3 className="font-headline-md text-lg font-bold">{selectedExercise.title}</h3>
          </div>
          <div className="w-12 h-12"></div> {/* Spacer */}
        </div>

        {/* Main Focus Area */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
          
          <div className="relative w-72 h-72 flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-white/5 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
            <div className="absolute inset-4 bg-white/10 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
            
            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-2xl">
              <circle cx="144" cy="144" r="130" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle 
                cx="144" 
                cy="144" 
                r="130" 
                fill="transparent" 
                stroke="white" 
                strokeWidth="8" 
                strokeDasharray={2 * Math.PI * 130} 
                strokeDashoffset={2 * Math.PI * 130 * (1 - sessionProgress / 100)} 
                className="transition-all duration-1000 ease-linear" 
                strokeLinecap="round" 
              />
            </svg>
            
            <div className="relative flex flex-col items-center text-white">
              <span className="text-6xl font-black tabular-nums tracking-tight">{formatTime(sessionTimeLeft)}</span>
              <span className="text-sm font-bold text-white/60 mt-2 uppercase tracking-widest">Remaining</span>
            </div>
          </div>
          
          <p className="text-white/80 font-body-md text-lg text-center max-w-xs animate-pulse">
            Focus on your breathing. Follow the rhythm.
          </p>

        </div>

        {/* Controls */}
        <div className="relative z-10 p-10 flex justify-center pb-20">
          <button
            onClick={() => setIsSessionActive(!isSessionActive)}
            className="w-20 h-20 rounded-full bg-white text-secondary flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-4xl">
              {isSessionActive ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>

      </div>
    );
  };

  return (
    <div className="h-full relative overflow-x-hidden">
      {viewState === 'dashboard' && renderDashboard()}
      {viewState === 'library' && renderLibrary()}
      {viewState === 'detail' && renderDetail()}
      {viewState === 'session' && renderSession()}
    </div>
  );
};
