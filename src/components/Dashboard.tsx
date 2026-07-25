/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Certificate, Activity, StudentPortfolioData } from '../types';
import { Award, BookOpen, Clock, CheckCircle2, AlertCircle, FileText, Users, Settings, Plus, GraduationCap, BellRing } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  certificates: Certificate[];
  activities: Activity[];
  portfolioData: StudentPortfolioData;
  allStudents?: User[];
  allPortfolios?: {studentId: string, portfolio: StudentPortfolioData}[];
  onNavigate: (tab: string, sectionId?: number) => void;
}

export default function Dashboard({
  currentUser,
  certificates,
  activities,
  portfolioData,
  allStudents = [],
  allPortfolios = [],
  onNavigate
}: DashboardProps) {
  
  // Safe fallbacks for portfolioData arrays and objects to prevent white screen crashes
  const researchExperience = Array.isArray(portfolioData?.researchExperience) ? portfolioData.researchExperience : [];
  const milestones = Array.isArray(portfolioData?.milestones) ? portfolioData.milestones : [];
  const englishTest = portfolioData?.englishTest || { testName: '', dateTaken: '', scoreAchieved: '', requiredScore: '', status: 'Not Started', evidence: '' };
  const englishReflection = portfolioData?.englishReflection || '';

  // Calculate statistics for STUDENT
  const totalCerts = certificates.filter(c => c.StudentID === currentUser.StudentID || currentUser.Role !== 'STUDENT');
  const approvedCerts = totalCerts.filter(c => c.Status === 'APPROVED');
  const pendingCerts = totalCerts.filter(c => c.Status === 'PENDING');
  
  const totalActivities = activities.filter(a => a.StudentID === currentUser.StudentID || currentUser.Role !== 'STUDENT');
  const approvedActivities = totalActivities.filter(a => a.Status === 'APPROVED');

  // Sum of research experience hours (from portfolioData)
  const completedHours = researchExperience.reduce((sum, item) => sum + (item?.hours || 0), 0);
  const targetHours = 180;
  const hoursPercent = Math.min(100, Math.round((completedHours / targetHours) * 100));

  // Count completed milestones
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m?.status === 'Completed').length;
  const milestonesPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  if (currentUser.Role === 'ADMIN') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-tu-red to-red-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-6 translate-y-6">
            <GraduationCap size={240} />
          </div>
          <div className="relative z-10 max-w-xl">
            <span className="bg-tu-gold text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">System Administration</span>
            <h1 className="text-2xl font-bold mt-2">Welcome to System Admin Dashboard</h1>
            <p className="text-red-100 mt-1 text-sm leading-relaxed">
              Faculty of Nursing, Thammasat University. Manage doctoral student portfolios, academic advisors, configure form options, and monitor system activity logs.
            </p>
          </div>
        </div>

        {/* Admin Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-red-50 text-tu-red rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900">{allStudents.filter(s => s.Role === 'STUDENT').length} Students</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-tu-gold rounded-xl">
              <Award size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Advisors</p>
              <h3 className="text-2xl font-bold text-gray-900">{allStudents.filter(s => s.Role === 'ADVISOR' || s.Role === 'SUPER_ADVISOR').length} Advisors</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Co-Advisors</p>
              <h3 className="text-2xl font-bold text-gray-900">{allStudents.filter(s => s.Role === 'CO_ADVISOR').length} Co-Advisors</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending Certs</p>
              <h3 className="text-2xl font-bold text-gray-900">{certificates.filter(c => c.Status === 'PENDING').length} Items</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending Activities</p>
              <h3 className="text-2xl font-bold text-gray-900">{activities.filter(a => a.Status === 'PENDING').length} Items</h3>
            </div>
          </div>
        </div>

        {/* Admin Quick Links */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Administration Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-red-50 hover:text-tu-red rounded-xl transition duration-200 group text-left"
            >
              <div>
                <h4 className="font-semibold text-sm">User Account Management</h4>
                <p className="text-xs text-gray-500">Add, remove, or modify student and advisor accounts</p>
              </div>
              <Users size={18} className="text-gray-400 group-hover:text-tu-red transition-colors" />
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-amber-50 hover:text-tu-gold rounded-xl transition duration-200 group text-left"
            >
              <div>
                <h4 className="font-semibold text-sm">System Option Parameters</h4>
                <p className="text-xs text-gray-500">Manage drop-down lists for advisors and academic majors</p>
              </div>
              <Settings size={18} className="text-gray-400 group-hover:text-tu-gold transition-colors" />
            </button>

            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-sm text-gray-800">Google Sheets Storage Link</h4>
              <p className="text-xs text-gray-500 mt-1">
                A secure Google Apps Script connection is automatically listening to keep records in sync.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (['ADVISOR', 'CO_ADVISOR', 'SUPER_ADVISOR'].includes(currentUser.Role)) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-tu-red to-red-900 text-white rounded-2xl p-6 shadow-md">
          <div className="max-w-2xl">
            <span className="bg-tu-gold text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">Faculty Major Advisor</span>
            <h1 className="text-2xl font-bold mt-2">Welcome, Academic Advisor</h1>
            <p className="text-red-100 mt-1 text-sm leading-relaxed">
              You are logged in as {currentUser.FullName}. Review dissertation progress, academic milestones, and approve student activity portfolios.
            </p>
          </div>
        </div>

        {/* Advisor Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-red-50 text-tu-red rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Supervised Students</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {allStudents.filter(s => s.Advisor === currentUser.FullName || s.CoAdvisor === currentUser.FullName).length || 1} Students
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-tu-gold rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Certificates to Review</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {certificates.filter(c => c.Status === 'PENDING').length} Items
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending Activities</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {activities.filter(a => a.Status === 'PENDING').length} Items
              </h3>
            </div>
          </div>
        </div>


        {/* Advisor Aggregated Dissertation Progress (Sec 5.3) */}
        {(() => {
          // Find students supervised by this advisor
          const supervisedStudents = allStudents.filter(s => s.Advisor === currentUser.FullName || s.CoAdvisor === currentUser.FullName);
          const studentIds = supervisedStudents.map(s => s.StudentID);
          
          // Aggregate milestone progress
          // The structure is an array of steps in dissertationProgress for each student. 
          // We need to count how many students have NOT 'Completed' a specific step.
          // Step names are in prog.activity (e.g., "1. Abstract").
          
          const stepStats = {};
          
          allPortfolios.forEach(({studentId, portfolio}) => {
            if (studentIds.includes(studentId)) {
              const dp = portfolio.dissertationProgress || [];
              dp.forEach(prog => {
                if (!prog.activity) return;
                if (!stepStats[prog.activity]) {
                  stepStats[prog.activity] = { total: 0, notCompleted: 0 };
                }
                stepStats[prog.activity].total += 1;
                if (prog.progress !== 'Completed') {
                  stepStats[prog.activity].notCompleted += 1;
                }
              });
            }
          });
          
          const activeSteps = Object.keys(stepStats).filter(activity => stepStats[activity].total > 0);
          
          if (activeSteps.length === 0) return null;

          return (
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <h3 className="text-base font-semibold text-gray-900">5.3 Dissertation Progress Overview</h3>
                <span className="text-xs text-gray-500">Supervised Students</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeSteps.map(activity => (
                  <div key={activity} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 truncate">Milestone</p>
                      <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">{activity}</h4>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="flex items-end justify-center gap-1">
                        <span className="text-xl font-bold text-tu-red font-mono">{stepStats[activity].notCompleted}</span>
                        <span className="text-xs text-gray-500 mb-1">/{stepStats[activity].total}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium">Not Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Quick Advisor Panel Redirection */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Go to Advising & Approvals Panel</h3>
            <p className="text-sm text-gray-500 mt-1">Verify research experience hours (minimum 180 hours) and provide qualitative comments.</p>
          </div>
          <button
            onClick={() => onNavigate('advisor')}
            className="px-5 py-2.5 bg-tu-red hover:bg-tu-red-hover text-white rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            Open Advisor Portal
          </button>
        </div>
      </div>
    );
  }

  // default to STUDENT view
  // Calculate delayed dissertation progress
  const delayedProgress = (portfolioData?.dissertationProgress || []).filter(prog => {
    if (prog.progress === 'Completed' || !prog.date) return false;
    // prog.date is YYYY-MM
    const [year, month] = prog.date.split('-');
    if (!year || !month) return false;
    const targetDate = new Date(parseInt(year), parseInt(month) - 1);
    const currentDate = new Date();
    // Compare YYYY-MM directly
    const targetMonthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    return targetMonthStr < currentMonthStr;
  });

  return (
    <div className="space-y-6">
      {delayedProgress.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl shadow-sm flex items-start gap-4">
          <div className="p-2 bg-red-100 text-tu-red rounded-full shrink-0 mt-0.5">
            <BellRing size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-800">Action Required: Overdue Progress</h3>
            <p className="text-xs text-red-700 mt-1">
              You have {delayedProgress.length} dissertation milestone(s) that have passed their target date and are not yet marked as 'Completed'. 
              Please update your progress or notify your advisor.
            </p>
            <ul className="mt-2 space-y-1">
              {delayedProgress.map((prog, idx) => (
                <li key={idx} className="text-xs font-medium text-red-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  {prog.activity} (Target: {prog.date})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {/* Student Welcome Jumbotron */}
      <div className="bg-gradient-to-r from-tu-red to-red-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-6 translate-y-6">
          <GraduationCap size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-tu-gold text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">Doctor of Philosophy (PhD)</span>
            <h1 className="text-2xl font-bold">PhD Candidate Portfolio</h1>
            <p className="text-red-100 text-sm max-w-xl">
              {currentUser.FullName} | Student ID: <span className="font-mono bg-red-900/40 px-1.5 py-0.5 rounded">{currentUser.StudentID || 'N/A'}</span>
            </p>
            <p className="text-red-100 text-xs italic max-w-xl line-clamp-1">
              Dissertation Title: "{currentUser.ThesisTitle || 'Please define your thesis title in your profile settings'}"
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('edit')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Edit 16-Section Portfolio
            </button>
            <button
              onClick={() => onNavigate('print')}
              className="px-4 py-2 bg-tu-gold hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText size={14} />
              Print Preview Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress 180 Hours Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Research Hours accumulated (Sec 6.1)</h3>
              <span className="p-2 bg-red-50 text-tu-red rounded-lg">
                <Clock size={18} />
              </span>
            </div>
            
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-gray-900 font-mono">{completedHours}</span>
              <span className="text-sm text-gray-500">/ {targetHours} Hours Required</span>
            </div>

            {/* Circular representation or bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span className="font-semibold">{hoursPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-tu-red h-full rounded-full transition-all duration-1000"
                  style={{ width: `${hoursPercent}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
            <span>Logged Research Entries: {researchExperience.length}</span>
            <button onClick={() => onNavigate('edit', 6)} className="text-tu-red font-semibold hover:underline cursor-pointer">
              View Details
            </button>
          </div>
        </div>

        {/* Milestone Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Milestone Progression (Sec 2.2)</h3>
              <span className="p-2 bg-amber-50 text-tu-gold rounded-lg">
                <GraduationCap size={18} />
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-gray-900 font-mono">{completedMilestones}</span>
              <span className="text-sm text-gray-500">/ {totalMilestones} Steps</span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span className="font-semibold">{milestonesPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-tu-gold h-full rounded-full transition-all duration-1000"
                  style={{ width: `${milestonesPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
            <span>Not Started Milestones: {milestones.filter(m => m?.status === 'Not Started').length}</span>
            <button onClick={() => onNavigate('edit', 2)} className="text-tu-gold font-semibold hover:underline cursor-pointer">
              Milestone Map
            </button>
          </div>
        </div>

        {/* Academic Certificates Status */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Certificates & Credentials (Sec 4.4)</h3>
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Award size={18} />
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mt-2">
              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-xl font-bold text-emerald-700 font-mono">{approvedCerts.length}</span>
                <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Approved</p>
              </div>
              <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                <span className="text-xl font-bold text-amber-700 font-mono">{pendingCerts.length}</span>
                <p className="text-[10px] text-amber-600 font-medium mt-0.5">Pending</p>
              </div>
              <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                <span className="text-xl font-bold text-red-700 font-mono">{totalCerts.filter(c => c.Status === 'REJECTED').length}</span>
                <p className="text-[10px] text-red-600 font-medium mt-0.5">Revision</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
            <span>Total Uploaded: {totalCerts.length} items</span>
            <button onClick={() => onNavigate('info')} className="text-tu-red font-semibold hover:underline cursor-pointer">
              View Certificates
            </button>
          </div>
        </div>
      </div>

      {/* Active Milestone Highlight & Recent Activities Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Milestones Checklist */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Active Milestones</h3>
              <p className="text-xs text-gray-500">Your key next tasks towards graduation progress</p>
            </div>
            <span className="text-xs font-mono font-medium text-tu-red bg-red-50 px-2 py-1 rounded">
              PhD Nursing Program
            </span>
          </div>

          <div className="space-y-3">
            {milestones
              .filter(m => m?.status === 'In Progress')
              .map((milestone) => (
                <div key={milestone.key} className="flex items-start gap-3 p-3.5 bg-amber-50/40 border border-amber-100 rounded-xl">
                  <div className="p-1 bg-amber-100 text-tu-gold rounded-full mt-0.5">
                    <AlertCircle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800">{milestone.label}</h4>
                      <span className="text-xs font-medium bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-mono">
                        In Progress
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Planned Date: {milestone.plannedDate || 'TBD'}</span>
                      <span className="italic">{milestone.remarks || 'No remarks'}</span>
                    </div>
                  </div>
                </div>
              ))}

            {milestones.filter(m => m?.status === 'In Progress').length === 0 && (
              <p className="text-sm text-gray-500 text-center py-6">No current active milestones in progress. You can update milestone stages in Section 2.</p>
            )}
          </div>
        </div>

        {/* English Language Proficiency quick card */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h3 className="text-sm font-semibold text-gray-900">English Proficiency Requirement (Sec 3.1)</h3>
              <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Requirement Met
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Test Standard:</span>
                <span className="font-semibold text-gray-800 font-mono">{englishTest.testName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Your Score:</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">{englishTest.scoreAchieved}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Required Minimum:</span>
                <span className="font-semibold text-gray-600 font-mono">{englishTest.requiredScore}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Date Met:</span>
                <span className="font-semibold text-gray-700">{englishTest.dateTaken}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-50 text-xs text-gray-500">
            <span className="font-medium block mb-1">English Learning Journey Reflection:</span>
            <p className="line-clamp-2 text-[11px] leading-normal italic text-gray-600">
              "{englishReflection || 'No reflection logged yet.'}"
            </p>
          </div>
        </div>
      </div>

      {/* Dissertation Progress (Sec 5.3) */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <h3 className="text-base font-semibold text-gray-900">5.3 Dissertation Progress Record</h3>
          <button onClick={() => onNavigate('edit', 5)} className="text-xs font-semibold text-tu-red hover:underline cursor-pointer">
            View / Update Progress
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(portfolioData?.dissertationProgress || []).map((prog, idx) => (
            <div key={idx} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Planned Activity / Milestone</p>
                  <h4 className="text-sm font-semibold text-gray-800">{prog.activity}</h4>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Target Date</p>
                  <span className="text-xs font-mono font-medium text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">
                    {prog.date || 'Not set'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Progress Outcome</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    prog.progress === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                    prog.progress === 'In progress' ? 'bg-amber-50 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {prog.progress || 'Not started'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Obstacles</p>
                  <p className="text-xs text-gray-600 truncate" title={prog.obstacles}>{prog.obstacles || '-'}</p>
                </div>
              </div>
            </div>
          ))}
          
          {(!portfolioData?.dissertationProgress || portfolioData.dissertationProgress.length === 0) && (
            <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-sm text-gray-500">No dissertation progress records yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
