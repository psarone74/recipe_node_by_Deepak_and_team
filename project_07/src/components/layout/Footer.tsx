import React from 'react';
import { UtensilsCrossed, Database, Cpu, ShieldCheck, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#002b20] text-stone-300 border-t border-[#003629] mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                RecipeMaster
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-md">
              Full-Stack MERN Recipe Management and Intelligent Pantry Meal Planning Platform.
              Engineered with deterministic ingredient normalization, match percentage calculus, 
              Mongoose relational schemas, and third-party food API aggregation.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-emerald-400">
              <span className="flex items-center gap-1.5 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/40">
                <Database className="w-3.5 h-3.5" /> MongoDB Atlas
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/40">
                <Cpu className="w-3.5 h-3.5" /> Express & Node.js
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/40">
                <ShieldCheck className="w-3.5 h-3.5" /> JWT & bcrypt
              </span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3 font-mono">
              Intelligent Modules
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>• Smart Pantry Matching Engine</li>
              <li>• Weekly Meal Planner & Macros</li>
              <li>• Automated Missing Grocery Sync</li>
              <li>• Third-Party TheMealDB Aggregator</li>
              <li>• Grounded Search Culinary Advisor</li>
            </ul>
          </div>

          {/* Academic / Viva Mapping */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3 font-mono">
              University Evaluation
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>• RESTful API (CRUD Complete)</li>
              <li>• Normalized Schema Validation</li>
              <li>• Stateless JWT Authorization</li>
              <li>• Postman Testable Collection</li>
              <li>• Responsive Mobile-First Design</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-emerald-950/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 RecipeMaster Platform. Built for University MERN Capstone Assessment.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded font-mono">
              v1.0.0 Production Release
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
