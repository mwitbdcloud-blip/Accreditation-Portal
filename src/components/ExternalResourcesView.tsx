import React from 'react';
import { ExternalLink, Cloud, DollarSign, UserPlus, Image, FileText, CheckCircle2 } from 'lucide-react';

export const ExternalResourcesView: React.FC = () => {
  return (
    <div id="external-resources-view" className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Affiliate Ecosystem & External Portals</h2>
        <p className="text-xs text-slate-500 mt-1">
          Direct operational links to Megaworld International hubs, commission accounting, recruitment forms, and approved marketing drives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TBD Cloud & Agents Hub */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-blue-50 text-blue-900 rounded-xl">
                <Cloud className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Primary Agents Hub
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">MWI TBD Cloud</h3>
            <p className="text-xs text-slate-500 mt-1">
              Centralized platform for Megaworld International property marketing materials, project inventory updates, price lists, and developer announcements.
            </p>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
              URL: https://www.mwitbdcloud.com
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <a
              href="https://www.mwitbdcloud.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition shadow-xs"
            >
              Launch TBD Cloud <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Commission System */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Commission Accounting
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">MWI Commission System</h3>
            <p className="text-xs text-slate-500 mt-1">
              Check payout schedules, client reservations, transaction vouchers, and sales production records linked to your permanent Affiliate Code.
            </p>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
              URL: http://mwiagents.megaworldcorp.com
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <a
              href="http://mwiagents.megaworldcorp.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl transition shadow-xs"
            >
              Open Commission Portal <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Recruitment Typeforms */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-purple-50 text-purple-800 rounded-xl">
                <UserPlus className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                Recruitment Channels
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Recruitment Typeforms</h3>
            <p className="text-xs text-slate-500 mt-1">
              Share dedicated regional intake links to recruit new International Property Affiliates and expand your downline sales team.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Marketing Associate Onboarding Intake
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Managing Associate Application Form
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Director Endorsement Queue
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => alert('Recruitment link copied to clipboard!')}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Copy Recruitment Link
            </button>
          </div>
        </div>

        {/* Marketing Assets Drive */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-amber-50 text-amber-800 rounded-xl">
                <Image className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Official Google Drive
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Social Media Assets Google Drive</h3>
            <p className="text-xs text-slate-500 mt-1">
              Approved digital brochures, social media post templates, high-resolution renderings, and developer logos for Megaworld properties worldwide.
            </p>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              Curated by Megaworld International Global Business Development.
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <a
              href="https://drive.google.com/file/d/1ru-YiZ9SuL7WuIJQuhF4oaQXGcvQ1CS6/view"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-600 rounded-xl transition shadow-xs"
            >
              Open Marketing Assets Drive <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
