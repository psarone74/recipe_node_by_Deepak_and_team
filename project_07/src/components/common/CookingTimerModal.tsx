import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, Flame, Bell, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import { IRecipe } from '../../services/recipeService';

interface CookingTimerModalProps {
  recipe: IRecipe;
  onClose: () => void;
}

export const CookingTimerModal: React.FC<CookingTimerModalProps> = ({ recipe, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // Default 3 min per step
  const [timerDuration, setTimerDuration] = useState(180);
  const [isRunning, setIsRunning] = useState(false);
  const [parallelPots, setParallelPots] = useState([
    { id: 'pot1', name: 'Primary Pan', time: 180, active: true },
    { id: 'pot2', name: 'Water Boil Pot', time: 480, active: false },
  ]);
  const [miseEnPlaceChecked, setMiseEnPlaceChecked] = useState<Record<string, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play synthetic chime via Web Audio API
  const playSoundChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      // AudioContext unavailable or blocked
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playSoundChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStepChange = (index: number) => {
    if (index >= 0 && index < recipe.instructions.length) {
      setCurrentStepIndex(index);
      // Auto estimate step duration based on step text length or keywords
      const stepText = recipe.instructions[index] || '';
      let seconds = 180;
      if (stepText.match(/(\d+)\s*(?:min|minute)/i)) {
        const mins = parseInt(stepText.match(/(\d+)\s*(?:min|minute)/i)![1], 10);
        seconds = mins * 60;
      }
      setTimerDuration(seconds);
      setTimeLeft(seconds);
      setIsRunning(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Circular progress computation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = timerDuration > 0 ? (timerDuration - timeLeft) / timerDuration : 0;
  const strokeDashoffset = circumference - progressPercent * circumference;

  const currentStepText = recipe.instructions[currentStepIndex] || 'Follow recipe directions carefully.';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#121c17] text-stone-100 rounded-3xl border border-emerald-950 max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/60 bg-[#0c1612]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Flame className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-semibold block">
                Epicurean Guided Cooking Mode
              </span>
              <h2 className="text-base font-serif font-bold text-white truncate max-w-md">
                {recipe.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={playSoundChime}
              title="Test audio chime"
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progression Pills */}
        <div className="px-6 py-3 bg-[#0d1814] border-b border-emerald-950 flex items-center gap-2 overflow-x-auto">
          {recipe.instructions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleStepChange(idx)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                idx === currentStepIndex
                  ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm'
                  : idx < currentStepIndex
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
              }`}
            >
              <span>Step {idx + 1}</span>
              {idx < currentStepIndex && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>
          ))}
        </div>

        {/* Core Stage: Step Narrative & Circular Timer */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Step Detail */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-mono uppercase tracking-wider text-emerald-400">
                Action {currentStepIndex + 1} of {recipe.instructions.length}
              </span>
              <span className="bg-stone-800/80 px-2 py-0.5 rounded text-[11px]">
                {recipe.difficulty} Complexity
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#17251f] border border-emerald-900/60 shadow-inner">
              <p className="font-serif text-lg text-stone-100 leading-relaxed">
                "{currentStepText}"
              </p>
            </div>

            {/* Quick Step Nav Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentStepIndex === 0}
                onClick={() => handleStepChange(currentStepIndex - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300 hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </button>

              <button
                disabled={currentStepIndex === recipe.instructions.length - 1}
                onClick={() => handleStepChange(currentStepIndex + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-stone-950 font-bold hover:bg-emerald-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Precision Circular Countdown Timer */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-[#14201a] rounded-2xl border border-emerald-950">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-stone-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Active Progress Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-emerald-400 transition-all duration-1000 ease-linear"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Time in center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-3xl font-extrabold text-white tracking-tight">
                  {formattedTime}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 mt-0.5">
                  {isRunning ? 'Cooking Active' : timeLeft === 0 ? 'Step Complete!' : 'Timer Paused'}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Start Timer
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setTimeLeft(timerDuration);
                }}
                className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
                title="Reset step timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Section: Mise En Place Checklist & Parallel Pot Tracker */}
        <div className="p-6 bg-[#0e1713] border-t border-emerald-950 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Mise En Place Checklist */}
          <div>
            <h4 className="font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-2">
              Mise En Place Ingredients ({recipe.ingredients.length})
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-2">
              {recipe.ingredients.map((ing, i) => {
                const isChecked = !!miseEnPlaceChecked[ing.name];
                return (
                  <label
                    key={i}
                    onClick={() =>
                      setMiseEnPlaceChecked((prev) => ({
                        ...prev,
                        [ing.name]: !isChecked,
                      }))
                    }
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-colors ${
                      isChecked
                        ? 'bg-emerald-950/40 border-emerald-800 text-stone-400 line-through'
                        : 'bg-stone-900/80 border-stone-800 text-stone-200 hover:border-emerald-700'
                    }`}
                  >
                    <span>{ing.name}</span>
                    <span className="font-mono text-stone-400">
                      {ing.quantity} {ing.unit}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Parallel Pot Tracker */}
          <div>
            <h4 className="font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-2">
              Parallel Pot & Hob Tracker
            </h4>
            <div className="space-y-2">
              {parallelPots.map((pot) => (
                <div
                  key={pot.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-stone-800"
                >
                  <div className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-medium text-stone-200">{pot.name}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">
                    {Math.floor(pot.time / 60)}:00 Left
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
