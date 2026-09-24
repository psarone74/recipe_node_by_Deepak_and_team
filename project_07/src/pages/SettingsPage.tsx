import React from 'react';
import { Database, Cpu, Server, ShieldCheck, CheckCircle2, FileCode, Layers, Terminal } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const endpoints = [
    { method: 'POST', path: '/api/auth/register', desc: 'Registers new user with bcrypt password hash' },
    { method: 'POST', path: '/api/auth/login', desc: 'Authenticates credentials & signs JWT bearer token' },
    { method: 'GET', path: '/api/recipes', desc: 'Query recipes with multi-parameter filtering & pagination' },
    { method: 'POST', path: '/api/recipes', desc: 'Creates new recipe with structured ingredient schema' },
    { method: 'GET', path: '/api/pantry', desc: 'Retrieves authenticated user pantry inventory' },
    { method: 'POST', path: '/api/pantry', desc: 'Adds ingredient to pantry with expiry date' },
    { method: 'GET', path: '/api/matching', desc: 'Intelligent pantry matching algorithm with percentage calculus' },
    { method: 'GET', path: '/api/shopping-list', desc: 'Returns aisle-grouped grocery checklist' },
    { method: 'POST', path: '/api/shopping-list/auto-stock', desc: '1-click atomic transfer of purchased items to pantry' },
    { method: 'GET', path: '/api/meal-plans/weekly', desc: '7-day visual calendar aggregated with nutrition macros' },
    { method: 'POST', path: '/api/favorites/toggle', desc: 'Toggles recipe favorite relation in user cookbook' },
    { method: 'GET', path: '/api/external-recipes/search', desc: 'Aggregates third-party recipes via TheMealDB REST API' },
    { method: 'POST', path: '/api/ai/culinary-advisor', desc: 'Google Search grounded substitute advisor via gemini-3.5-flash' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <span className="text-xs font-bold uppercase tracking-wider text-[#a23e18] font-mono">
          Capstone Architecture & Viva Defense
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#003629] tracking-tight mt-1">
          MERN Full-Stack Technical Documentation
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Complete architecture reference, data schemas, REST API documentation, and viva evaluation criteria.
        </p>
      </div>

      {/* Tech Stack Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
            <Database className="w-4 h-4" />
            <span>MongoDB / Mongoose</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            Relational schemas with resilient file-backed fallback persistence. Indexes on ingredient stems & userId.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-stone-800 font-bold mb-1">
            <Server className="w-4 h-4" />
            <span>Express.js & Node</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            Stateless REST API routing, centralized async error boundary, and modular controller architecture.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-sky-800 font-bold mb-1">
            <Layers className="w-4 h-4" />
            <span>React 19 & Tailwind</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            Modular component tree, functional custom hooks, context providers, and responsive mobile-first UI.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-[#a23e18] font-bold mb-1">
            <Cpu className="w-4 h-4" />
            <span>Gemini 3.5 Flash</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            Search Grounding with Google Search tool integration for live chef advice and culinary substitution ratios.
          </p>
        </div>
      </div>

      {/* Viva Evaluation Checklist */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h2 className="font-serif font-bold text-lg text-stone-900">
          University Academic Evaluation Checklist
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            'User Authentication: JWT tokens with 7-day expiration and bcryptjs hash encryption.',
            'CRUD Functionality: Complete create, read, update, and delete on Recipes, Pantry, and Meals.',
            'Smart Pantry Algorithm: Deterministic ingredient normalization & stem matching with percentage calculus.',
            'Third-Party API Aggregation: Real-time queries to TheMealDB with 1-click database import.',
            'Meal Scheduling Matrix: 7-day multi-slot planner with aggregated calorie and kitchen time counters.',
            'Aisle Grocery Management: Auto-categorized shopping checklist with atomic pantry restocking.',
            'Guided Cooking Timer: Circular SVG countdown, parallel pot tracker, and Web Audio API chime synthesis.',
            'Search Grounded AI Advisor: gemini-3.5-flash querying real-time web citations for ingredient substitutions.',
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-stone-700 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* REST API Endpoints Specification Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs space-y-3 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-stone-900">
            RESTful API Specification
          </h2>
          <span className="text-xs font-mono text-stone-500">Postman / cURL Ready</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-y border-stone-200 text-stone-500 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Endpoint Route</th>
                <th className="py-2.5 px-3">Description & Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {endpoints.map((ep, i) => (
                <tr key={i} className="hover:bg-stone-50/60">
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ep.method === 'GET'
                          ? 'bg-sky-100 text-sky-800'
                          : ep.method === 'POST'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ep.method === 'PUT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-stone-800">{ep.path}</td>
                  <td className="py-2 px-3 text-stone-600 font-sans">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
