/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../lib/googleSheets';
import { FileText, Copy, Check, ArrowRight, Github, Settings, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AppsScriptHelp() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-xs text-gray-700 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="bg-gradient-to-r from-tu-red to-red-800 text-white rounded-2xl p-6 shadow-md">
        <h2 className="text-lg font-bold">Google Sheets Database, Apps Script Connection & Vercel Deployment Guide</h2>
        <p className="text-red-100 text-xs mt-1 leading-relaxed">
          Professional integration blueprint for Thammasat University Nursing PhD Portfolio database migration and hosting. Follow these steps for seamless setup.
        </p>
      </div>

      {/* Grid of Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Step 1: Apps Script Backend setup */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
            <span className="w-5 h-5 bg-tu-red text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
            Google Sheets & Apps Script Setup (Automated Initialization)
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 pl-1 leading-normal">
            <li>Create an empty spreadsheet in your personal Google Sheets account.</li>
            <li>Navigate to <strong>Extensions &gt; Apps Script</strong> from the menu bar.</li>
            <li>Erase any boilerplate code in the script editor and paste the copied Google Apps Script code from the panel below.</li>
            <li><strong>Magic Step!</strong> Select <strong>setupDatabase</strong> in the top dropdown list and hit <strong>Run</strong>.</li>
            <li>The script automatically creates sheets with schema headers and generates 5-6 rows of representative mock data for each sheet:
              <ul className="list-disc list-inside pl-4 font-mono text-[10px] text-tu-red grid grid-cols-2 mt-1">
                <li>Users</li>
                <li>Certificates</li>
                <li>Activities</li>
                <li>ConfigOptions</li>
                <li>ActivityLogs</li>
                <li>Portfolios</li>
                <li>Chats</li>
                <li>Notifications</li>
              </ul>
            </li>
            <li>Click <strong>Deploy &gt; New Deployment</strong> in the upper-right corner.</li>
            <li>Configure the deployment as a <strong>Web App</strong> with these parameters:
              <ul className="list-disc list-inside pl-4 text-gray-500">
                <li>Execute as: <span className="font-semibold text-gray-700">Me (your-email)</span></li>
                <li>Who has access: <span className="font-semibold text-gray-700">Anyone</span></li>
              </ul>
            </li>
            <li>Copy the generated <strong>Web App URL</strong> and paste it into the Web App Settings panel.</li>
          </ol>
        </div>

        {/* Step 2: Vercel & GitHub Guide */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
            <span className="w-5 h-5 bg-tu-red text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
            GitHub Export & Vercel Production Deployment
          </h3>
          <div className="space-y-3 pl-1 text-gray-600 leading-normal">
            <div>
              <h4 className="font-semibold text-gray-800 flex items-center gap-1">
                <Github size={13} />
                Push your codebase to GitHub:
              </h4>
              <p className="mt-1">
                Commit the entire repository (excluding `node_modules` and output build folders) and push to your public or private GitHub repository.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 flex items-center gap-1">
                <Settings size={13} />
                Setup Environment Variables on Vercel:
              </h4>
              <p className="mt-1">
                During Vercel project import, add the following key-value environment configuration variable:
              </p>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 font-mono text-[10px] text-gray-700 mt-1 space-y-1">
                <p><strong>VITE_APPS_SCRIPT_URL</strong> = [Your Apps Script Web App URL]</p>
              </div>
            </div>

            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 flex items-start gap-1.5">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <span>
                <strong>CORS Prevention Support:</strong> The client-side API layer handles direct posting seamlessly using optimized no-cors payloads. Database writes compile perfectly without browser CORS blocks.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Google Drive folder instructions */}
      <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl border border-amber-100 space-y-2">
        <h3 className="font-bold text-sm flex items-center gap-1.5 text-amber-900">
          <AlertTriangle size={16} />
          Google Drive "Bird" Folder Configuration for Document Uploads
        </h3>
        <p className="leading-relaxed">
          To ensure certificates and activity proof photos render correctly across browsers:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-amber-950">
          <li>Create a folder named <strong className="font-mono text-tu-red">Bird</strong> in your Google Drive.</li>
          <li>Change the folder sharing permissions to <strong>"Anyone with the link can view"</strong> (public display).</li>
          <li>Uploaded files generate high-resolution shareable previews dynamically stored in Google Sheets and exported within the portfolio PDF report.</li>
        </ul>
      </div>

      {/* Copyable code panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
          <span className="font-bold text-gray-800">Google Apps Script Code (Click Copy & Run)</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 bg-tu-red hover:bg-tu-red-hover text-white rounded-lg font-bold transition duration-200 cursor-pointer"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <div className="p-5">
          <pre className="bg-gray-950 text-gray-100 p-4 rounded-xl overflow-x-auto text-[10px] font-mono leading-normal max-h-72 select-all">
            {GOOGLE_APPS_SCRIPT_CODE}
          </pre>
        </div>
      </div>

    </div>
  );
}
