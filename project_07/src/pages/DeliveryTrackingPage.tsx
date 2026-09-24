import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Package, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { usePantry } from '../context/PantryContext';

interface DeliveryTrackingPageProps {
  onNavigate: (tab: string, recipeId?: string) => void;
}

export const DeliveryTrackingPage: React.FC<DeliveryTrackingPageProps> = ({ onNavigate }) => {
  const { itemCount: pantryCount } = usePantry();
  const [etaMinutes, setEtaMinutes] = useState(18);
  const [currentMilestone, setCurrentMilestone] = useState(3); // 3: Out for delivery

  useEffect(() => {
    const timer = setInterval(() => {
      setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const milestones = [
    { label: 'Order Placed', time: '11:20 AM', done: true },
    { label: 'Shopper Assigned', time: '11:24 AM', done: true },
    { label: 'Aisles Picked & Scanned', time: '11:38 AM', done: true },
    { label: 'Out for Courier Delivery', time: '11:42 AM', done: true, active: true },
    { label: 'Delivered to Doorstep', time: 'Est. 12:00 PM', done: false },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-[#003629] text-white p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-300 font-bold block">
              Live Courier Tracking • Whole Foods Partner
            </span>
            <h1 className="font-serif text-3xl font-extrabold tracking-tight mt-1">
              Groceries are on the way!
            </h1>
            <p className="text-xs text-stone-200 mt-1">
              Order #RM-984321 • Contactless drop-off at your front door.
            </p>
          </div>

          <div className="bg-emerald-950/80 border border-emerald-800 p-4 rounded-2xl text-center shrink-0">
            <span className="text-[10px] uppercase font-mono text-emerald-300 block">Estimated Arrival</span>
            <span className="font-mono text-3xl font-black text-white">{etaMinutes} mins</span>
          </div>
        </div>
      </div>

      {/* Driver Card & Live Simulated Map */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Driver Details */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
            Courier Partner
          </h2>

          <div className="flex items-center gap-3.5">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop"
              alt="Marcus T"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#003629]/20"
            />
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">Marcus T.</h3>
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <span className="text-amber-500 font-bold">★ 4.98</span>
                <span>• 1,420 Deliveries</span>
              </div>
              <span className="text-[11px] text-stone-500 block font-mono">
                White Toyota Prius (7XYZ89)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => alert('Courier notified: Ring doorbell upon arrival.')}
              className="flex-1 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-stone-500" />
              <span>Message</span>
            </button>
            <button
              onClick={() => alert('Dialing courier dispatch...')}
              className="flex-1 py-2.5 rounded-xl bg-[#003629] text-white text-xs font-bold hover:bg-[#1b4d3e] flex items-center justify-center gap-1.5"
            >
              <Phone className="w-4 h-4 text-emerald-300" />
              <span>Call Courier</span>
            </button>
          </div>

          {/* Instant Pantry Sync Badge */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Instant Pantry Pipeline Sync Active</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Your pantry count was incremented automatically. Current active pantry ingredients: <strong className="text-emerald-950 font-mono">{pantryCount} items</strong>.
            </p>
          </div>
        </div>

        {/* Live Vector Delivery Map Simulation */}
        <div className="md:col-span-7 bg-[#1c2822] rounded-2xl border border-emerald-950 overflow-hidden shadow-xs relative flex flex-col justify-between p-6 text-white min-h-[280px]">
          
          {/* Map Vector Grid Lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Map Route Graphics */}
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold block">
              Simulated Real-Time Route
            </span>
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>En route via Grand Ave & 4th Street • Speed: 24 mph</span>
            </div>
          </div>

          {/* Center Graphic */}
          <div className="relative z-10 my-auto flex items-center justify-between px-8 py-6">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center mx-auto text-emerald-400">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase text-stone-300 block">Whole Foods Store</span>
            </div>

            <div className="flex-1 mx-4 border-t-2 border-dashed border-emerald-500/60 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-stone-950 p-1.5 rounded-full shadow-md animate-bounce">
                <Truck className="w-4 h-4" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-600 border border-emerald-400 flex items-center justify-center mx-auto text-white shadow-lg shadow-emerald-500/30">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase text-stone-300 block">Your Home</span>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-emerald-900/60">
            <span>Distance: 1.8 miles</span>
            <span className="text-emerald-400 font-mono font-bold">Driver 4 stops away</span>
          </div>

        </div>

      </div>

      {/* Milestone Progress Checklist */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-base text-stone-900">
          Delivery Status Milestones
        </h3>

        <div className="space-y-4">
          {milestones.map((m, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  m.done
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {m.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>

              <div className="flex-1 flex items-center justify-between text-xs">
                <span className={`font-semibold ${m.active ? 'text-[#003629] font-bold text-sm' : 'text-stone-700'}`}>
                  {m.label}
                  {m.active && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Current</span>}
                </span>
                <span className="font-mono text-stone-500 text-[11px]">{m.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={() => onNavigate('smart-match')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#003629] hover:underline"
          >
            <span>See newly unlocked recipes from these ingredients</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('pantry')}
            className="px-4 py-2 rounded-xl bg-[#003629] text-white text-xs font-bold hover:bg-[#1b4d3e]"
          >
            Go to Pantry
          </button>
        </div>
      </div>

    </div>
  );
};
