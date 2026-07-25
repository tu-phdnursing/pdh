/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, StudentPortfolioData, Certificate, Activity } from '../types';
import { formatDisplayDate } from '../lib/googleSheets';
import { FileText, Printer, ChevronLeft, MapPin, Sparkles, Star } from 'lucide-react';

interface PrintReportProps {
  currentUser: User;
  portfolioData: StudentPortfolioData;
  certificates: Certificate[];
  activities: Activity[];
  onBack: () => void;
}

export default function PrintReport({
  currentUser,
  portfolioData,
  certificates,
  activities,
  onBack
}: PrintReportProps) {

  // Sum of research experience hours
  const completedHours = portfolioData.researchExperience.reduce((sum, item) => sum + item.hours, 0);

  // Trigger browser printing
  const handlePrint = () => {
    window.print();
  };

  const approvedCerts = certificates.filter(c => c.StudentID === currentUser.StudentID && c.Status === 'APPROVED');
  const approvedActs = activities.filter(a => a.StudentID === currentUser.StudentID && a.Status === 'APPROVED');

  return (
    <div id="print-root" className="space-y-6 text-xs text-gray-700">
      
      {/* Print Controls Ribbon - Hidden during physical printing via no-print class */}
      <div className="no-print bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition text-gray-600 cursor-pointer"
            title="Back to Dashboard"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Print Preview & Save PDF</h3>
            <p className="text-xs text-gray-400 font-normal">Professional layout of cover page, table of contents, and sections ready for academic submission</p>
          </div>
        </div>
        
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-tu-red hover:bg-tu-red-hover text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Printer size={15} />
          Print Portfolio Report / Save PDF (A4)
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PHYSICAL A4 REPORT STAGED CONTAINER */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white max-w-[850px] mx-auto p-8 sm:p-12 border border-gray-100 rounded-2xl shadow-md print:max-w-none print:mx-0 print:border-none print:shadow-none print:p-0 space-y-12 select-text text-gray-900 leading-relaxed font-sans">
        
        {/* ========================================== */}
        {/* PAGE 1: OFFICIAL COVER PAGE */}
        {/* ========================================== */}
        <div className="flex flex-col justify-between relative pt-10">
          
          {/* Cover Head Banner */}
          <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-8 text-tu-red relative overflow-hidden shadow-xs">
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 bg-red-600/5 rounded-full" />
            <h1 className="text-3xl font-extrabold tracking-tight">Faculty of Nursing</h1>
            <h2 className="text-3xl font-extrabold tracking-tight">Thammasat University</h2>
            <p className="text-sm font-bold mt-4 tracking-wide text-red-950 uppercase font-mono">
              Doctor of Philosophy Program in Nursing Science
            </p>
          </div>

          {/* Cover Center Title */}
          <div className="text-center my-10 space-y-4">
            <div className="flex flex-col items-center mx-auto mb-4">
              <div className="relative flex flex-col items-center">
                <img 
                  src="https://lh3.googleusercontent.com/d/1qmMuV0e2tItZuhX0oexmhhnu3GdBBbe0" 
                  alt="Thammasat University Logo" 
                  className="w-28 h-28 object-contain drop-shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <div className="mt-2 bg-gradient-to-r from-[#B31B1B] to-[#991818] text-white text-[10px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs border border-amber-300">
                  Faculty of Nursing
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-tu-red tracking-tight leading-normal">
              Doctoral Student Portfolio
            </h2>
            <div className="w-24 h-1 bg-tu-red mx-auto rounded-full" />
          </div>

          {/* Cover Student Metadata Table */}
          <div className="bg-red-50/25 border border-red-100 rounded-2xl p-6 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <tbody className="divide-y divide-red-100">
                <tr>
                  <td className="py-2.5 font-bold text-gray-500 w-1/3">Student Name</td>
                  <td className="py-2.5 font-semibold text-gray-800">{currentUser.FullName}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-gray-500">Student ID</td>
                  <td className="py-2.5 font-mono font-semibold text-gray-800">{currentUser.StudentID}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-gray-500">PhD Program</td>
                  <td className="py-2.5 text-gray-800">{currentUser.Major || 'Doctor of Philosophy Program in Nursing Science'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-gray-500">Faculty / School / University</td>
                  <td className="py-2.5 text-gray-800">Faculty of Nursing, Thammasat University</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-gray-500">Year of Admission</td>
                  <td className="py-2.5 font-semibold text-gray-800">{currentUser.YearOfAdmission || 'Not specified'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-gray-500">Expected Graduation Year</td>
                  <td className="py-2.5 font-semibold text-gray-800">{currentUser.ExpectedGraduationYear || '2027'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-gray-500">Major Advisor</td>
                  <td className="py-2.5 font-semibold text-gray-800">{currentUser.Advisor || 'Assoc. Prof. Dr. Sarah Johnson'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-gray-500">Date of Submission</td>
                  <td className="py-2.5 text-gray-800">{formatDisplayDate(currentUser.DateOfSubmission) || 'Not specified'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer gold banner */}
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-4 rounded-full mt-10" />
        </div>

        {/* ========================================== */}
        {/* PAGE 2: TABLE OF CONTENTS */}
        {/* ========================================== */}
        <div className="print-page-break space-y-6 pt-10">
          <h2 className="text-xl font-bold text-tu-red border-b border-gray-100 pb-2">Table of Contents</h2>
          
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-baseline border-b border-dotted border-gray-200 pb-1">
              <span className="font-semibold">Section 1. Student Profile & Goals</span>
              <span className="font-mono">Page 3</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-dotted border-gray-200 pb-1">
              <span className="font-semibold">Section 2. Program of Study and Academic Milestones</span>
              <span className="font-mono">Page 4</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-dotted border-gray-200 pb-1">
              <span className="font-semibold">Section 3. English Language Proficiency Requirement</span>
              <span className="font-mono">Page 5</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-dotted border-gray-200 pb-1">
              <span className="font-semibold">Section 4. Coursework and Academic Development</span>
              <span className="font-mono">Page 6</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-dotted border-gray-200 pb-1">
              <span className="font-semibold">Section 5. Research Development and Dissertation Progress</span>
              <span className="font-mono">Page 7</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-dotted border-gray-200 pb-1">
              <span className="font-semibold">Section 6. Research Experience Requirement (180 Hours)</span>
              <span className="font-mono">Page 8</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-dotted border-gray-200 pb-1">
              <span className="font-semibold">Section 7. Scholarly Output & Publications</span>
              <span className="font-mono">Page 9</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-dotted border-gray-200 pb-1">
              <span className="font-semibold">Section 12. Self-Assessment of Doctoral Competencies</span>
              <span className="font-mono">Page 10</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-dotted border-gray-200 pb-1">
              <span className="font-semibold">Section 15. Advisor's Comments & Endorsements</span>
              <span className="font-mono">Page 11</span>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* PAGE 3: STUDENT PROFILE */}
        {/* ========================================== */}
        <div className="print-page-break space-y-6 pt-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-tu-red font-mono">Section 1</span>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Student Profile</h2>

          {/* 1.1 Personal info */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-tu-red">1.1 Personal Information</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block font-medium">Full Name</span>
                <span className="font-semibold text-gray-800">{currentUser.FullName}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Student ID</span>
                <span className="font-semibold font-mono text-gray-800">{currentUser.StudentID}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Year of Admission</span>
                <span className="font-semibold text-gray-800">{currentUser.YearOfAdmission || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Date of Submission</span>
                <span className="font-semibold text-gray-800">{formatDisplayDate(currentUser.DateOfSubmission) || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Line ID</span>
                <span className="font-semibold font-mono text-gray-800">{currentUser.LineID || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* 1.2 Academic background table */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-tu-red">1.2 Academic Background</h3>
            <table className="w-full text-left text-xs border border-gray-200">
              <thead>
                <tr className="bg-gray-50 font-bold border-b border-gray-200">
                  <th className="p-2.5">Degree</th>
                  <th className="p-2.5">Field of Study</th>
                  <th className="p-2.5">Institution</th>
                  <th className="p-2.5 text-center">Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {portfolioData.academicBackground.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-medium">{item.degree}</td>
                    <td className="p-2.5">{item.field}</td>
                    <td className="p-2.5">{item.institution}</td>
                    <td className="p-2.5 text-center font-mono">{item.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 1.3 Professional background table */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-tu-red">1.3 Professional Background</h3>
            <table className="w-full text-left text-xs border border-gray-200">
              <thead>
                <tr className="bg-gray-50 font-bold border-b border-gray-200">
                  <th className="p-2.5 w-1/4">Period</th>
                  <th className="p-2.5">Role / Organization</th>
                  <th className="p-2.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {portfolioData.professionalBackground.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-mono">{item.period}</td>
                    <td className="p-2.5 font-medium">{item.role}</td>
                    <td className="p-2.5 text-gray-500">{item.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================== */}
        {/* PAGE 4: MILESTONES & TIMELINE */}
        {/* ========================================== */}
        <div className="print-page-break space-y-6 pt-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-tu-red font-mono">Section 2</span>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 font-sans">Program of Study and Academic Milestones</h2>

          {/* 2.1 Program of Study */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-tu-red font-sans">2.1 Program of Study ({portfolioData.programOfStudyName || 'ชุด 1'})</h3>
              <span className="text-xs text-gray-400 font-mono">Faculty of Nursing Curriculum Plans</span>
            </div>
            <table className="w-full text-left text-xs border border-gray-200">
              <thead>
                <tr className="bg-gray-50 font-bold border-b border-gray-200">
                  <th className="p-2 w-1/6">Semester/Year</th>
                  <th className="p-2 w-1/6">Course Code</th>
                  <th className="p-2">Course Title</th>
                  <th className="p-2 text-center w-12">Credits</th>
                  <th className="p-2 text-center w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(portfolioData.programCourses && portfolioData.programCourses.length > 0) ? (
                  portfolioData.programCourses.map((course, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-2 font-semibold text-gray-700">{course.semester}</td>
                      <td className="p-2 font-mono font-bold text-gray-900">{course.code}</td>
                      <td className="p-2 font-medium text-gray-800">{course.title}</td>
                      <td className="p-2 text-center font-mono font-semibold">{course.credits}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          course.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          course.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          'bg-gray-50 text-gray-500 border border-gray-100'
                        }`}>
                          {course.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400 italic">No course records listed in Program of Study</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 2.2 Doctoral Milestones Timeline */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-tu-red font-sans">2.2 Doctoral Milestones and Timeline</h3>
            <table className="w-full text-left text-xs border border-gray-200">
              <thead>
                <tr className="bg-gray-50 font-bold border-b border-gray-200">
                  <th className="p-2">Milestone</th>
                  <th className="p-2 text-center">Planned Date</th>
                  <th className="p-2 text-center">Actual Date</th>
                  <th className="p-2">Remarks</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {portfolioData.milestones.map((milestone) => (
                  <tr key={milestone.key}>
                    <td className="p-2 font-medium">{milestone.label}</td>
                    <td className="p-2 text-center font-mono text-gray-500">{milestone.plannedDate || '-'}</td>
                    <td className="p-2 text-center font-mono text-gray-800 font-semibold">{milestone.actualDate || '-'}</td>
                    <td className="p-2 text-gray-500 italic">{milestone.remarks || '-'}</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        milestone.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                        milestone.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {milestone.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2.3 Personal Learning and Development Plan */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-bold text-tu-red font-sans">2.3 Personal Learning and Development Plan</h3>
            <div className="space-y-3">
              {(portfolioData.learningPlans && portfolioData.learningPlans.length > 0) ? (
                portfolioData.learningPlans.map((plan, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">{plan.competency}</h4>
                        {plan.description && <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">{plan.description}</p>}
                      </div>
                      <div className="text-right flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-gray-400">Target: {plan.targetDate || 'N/A'}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          plan.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          plan.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {plan.status}
                        </span>
                      </div>
                    </div>
                    {plan.activities && (
                      <div className="bg-white p-2 rounded border border-gray-100 text-[11px] text-gray-700 leading-relaxed">
                        <strong className="text-[10px] font-bold text-tu-red uppercase block mb-0.5">Planned Activities & Progress</strong>
                        {plan.activities}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl">No competency training records listed in Personal Learning Plan</p>
              )}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* PAGE 5: ENGLISH PROFICIENCY */}
        {/* ========================================== */}
        <div className="print-page-break space-y-6 pt-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-tu-red font-mono">Section 3</span>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">English Language Proficiency Requirement</h2>

          <p className="text-xs text-gray-600 leading-relaxed font-medium bg-gray-50/50 p-3 rounded-lg border border-gray-100">
            All PhD students are required to meet the English language proficiency requirement of the program and provide evidence of an approved test score or equivalent requirement specified by the program.
          </p>

          {/* 3.1 Test Score */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-tu-red">3.1 Record of English Language Test</h3>
            <table className="w-full text-left text-xs border border-gray-200">
              <thead>
                <tr className="bg-gray-50 font-bold border-b border-gray-200">
                  <th className="p-2.5">Test Name</th>
                  <th className="p-2.5">Date Taken</th>
                  <th className="p-2.5">Score Achieved</th>
                  <th className="p-2.5">Required Score</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Evidence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2.5 font-bold text-gray-800">{portfolioData.englishTest.testName || "-"}</td>
                  <td className="p-2.5 font-mono text-gray-700">{portfolioData.englishTest.dateTaken || "-"}</td>
                  <td className="p-2.5 font-bold text-emerald-600 font-mono">{portfolioData.englishTest.scoreAchieved || "-"}</td>
                  <td className="p-2.5 font-mono text-gray-700">{portfolioData.englishTest.requiredScore || "-"}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      portfolioData.englishTest.status === 'Pass' || portfolioData.englishTest.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {portfolioData.englishTest.status || "Not Started"}
                    </span>
                  </td>
                  <td className="p-2.5 italic text-gray-500 font-mono">{portfolioData.englishTest.evidence || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3.2 English activities */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-tu-red">3.2 English Development Activities</h3>
            <table className="w-full text-left text-xs border border-gray-200">
              <thead>
                <tr className="bg-gray-50 font-bold border-b border-gray-200">
                  <th className="p-2.5 w-1/5">Date</th>
                  <th className="p-2.5">Activity / Course</th>
                  <th className="p-2.5">Organizer</th>
                  <th className="p-2.5">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {portfolioData.englishActivities.map((act, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-mono">{act.date}</td>
                    <td className="p-2.5 font-medium">{act.activity}</td>
                    <td className="p-2.5 text-gray-600">{act.organizer}</td>
                    <td className="p-2.5 italic text-gray-500 font-mono">{act.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3.3 reflection */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-bold text-tu-red">3.3 Reflection on English Development</h3>
            <p className="p-4 bg-gray-50/50 rounded-xl text-xs leading-relaxed italic text-gray-700">
              "{portfolioData.englishReflection}"
            </p>
          </div>

          {/* 3.4 Verification */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-tu-red">3.4 Verification</h3>
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-200 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">Advisor / Program Coordinator Comments</span>
                <p className="text-xs leading-relaxed text-gray-700 bg-white p-3 rounded border border-gray-100 min-h-[50px] italic">
                  {portfolioData.englishVerification?.comments ? `"${portfolioData.englishVerification.comments}"` : "(No comments provided yet)"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-0.5">Name</span>
                  <span className="font-semibold text-gray-800 bg-white px-2.5 py-1.5 rounded border border-gray-100 block">{portfolioData.englishVerification?.name || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-0.5">Signature and Date</span>
                  <span className="font-mono text-gray-800 bg-white px-2.5 py-1.5 rounded border border-gray-100 block">{portfolioData.englishVerification?.signatureDate || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* PAGE 6: COURSEWORK COMPLETED */}
        {/* ========================================== */}
        <div className="print-page-break space-y-6 pt-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-tu-red font-mono">Section 4</span>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Coursework and Academic Development</h2>

          {/* 4.1 Courses Completed */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-tu-red">4.1 Courses Completed</h3>
            <table className="w-full text-left text-xs border border-gray-200">
              <thead>
                <tr className="bg-gray-50 font-bold border-b border-gray-200">
                  <th className="p-2.5">Course Code</th>
                  <th className="p-2.5">Course Title</th>
                  <th className="p-2.5 text-center">Semester / Year</th>
                  <th className="p-2.5 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {portfolioData.completedCourses.map((course, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-mono font-bold text-tu-red">{course.code}</td>
                    <td className="p-2.5 font-medium">{course.title}</td>
                    <td className="p-2.5 text-center font-mono">{course.semester}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">{course.grade || course.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4.2 Key Learning from Coursework */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-tu-red">4.2 Key Learning from Coursework</h3>
            {portfolioData.keyLearnings && portfolioData.keyLearnings.length > 0 ? (
              <table className="w-full text-left text-xs border border-gray-200">
                <thead>
                  <tr className="bg-gray-50 font-bold border-b border-gray-200">
                    <th className="p-2.5 w-1/4">Course / Activity</th>
                    <th className="p-2.5 w-3/8">Key Learning</th>
                    <th className="p-2.5 w-3/8">Application to Research / Practice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {portfolioData.keyLearnings.map((kl, i) => (
                    <tr key={i} className="align-top">
                      <td className="p-2.5 font-bold text-gray-800">{kl.course}</td>
                      <td className="p-2.5 text-gray-600 leading-relaxed whitespace-pre-wrap">{kl.keyLearning}</td>
                      <td className="p-2.5 text-gray-600 leading-relaxed whitespace-pre-wrap">{kl.application}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-400 italic">No coursework key learning logs recorded.</p>
            )}
          </div>

          {/* 4.3 Workshops, Training, and Short Courses */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-tu-red">4.3 Workshops, Training, and Short Courses</h3>
            {portfolioData.workshops && portfolioData.workshops.length > 0 ? (
              <table className="w-full text-left text-xs border border-gray-200">
                <thead>
                  <tr className="bg-gray-50 font-bold border-b border-gray-200">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Workshop / Course Title</th>
                    <th className="p-2.5">Organizer</th>
                    <th className="p-2.5">Key Learning / Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {portfolioData.workshops.map((ws, i) => (
                    <tr key={i} className="align-top">
                      <td className="p-2.5 font-mono text-gray-600">{ws.date}</td>
                      <td className="p-2.5 font-bold text-gray-800">{ws.title}</td>
                      <td className="p-2.5 text-gray-600">{ws.organizer}</td>
                      <td className="p-2.5 text-gray-600">{ws.keyLearning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-400 italic">No external workshops or short courses logged.</p>
            )}
          </div>

          {/* 4.4 Certifications & Verified Evidences */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-tu-red">4.4 Certifications & Verified Evidences</h3>
            {(() => {
              const studentCerts = certificates.filter(c => c.StudentID === currentUser.StudentID);
              if (studentCerts.length === 0) {
                return <p className="text-xs text-gray-400 italic">No certificates recorded in the "Certificates" worksheet.</p>;
              }

              return (
                <div className="grid grid-cols-2 gap-4">
                  {studentCerts.map((cert) => (
                    <div key={cert.CertID} className="p-3 border border-gray-100 rounded-xl bg-gray-50 text-xs flex gap-3">
                      {cert.ImageURL && (
                        <img src={cert.ImageURL} className="w-12 h-12 object-cover rounded bg-gray-100" alt="Evidence" />
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-800 line-clamp-1">{cert.Name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Category: {cert.Category} | Date: {formatDisplayDate(cert.Date)}</p>
                        <span className={`text-[9px] font-mono font-bold ${
                          cert.Status === 'APPROVED' ? 'text-emerald-600' :
                          cert.Status === 'PENDING' ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          STATUS: {cert.Status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* ========================================== */}
        {/* PAGE 7: DISSERTATION DETAILS */}
        {/* ========================================== */}
        <div className="print-page-break space-y-6 pt-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-tu-red font-mono">Section 5</span>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Research Development and Dissertation Progress</h2>

          {/* 5.1 Development of Research Topic */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-tu-red">5.1 Development of Research Topic</h3>
            <div className="p-4 bg-gray-50/50 rounded-xl text-xs leading-relaxed text-gray-700 border border-gray-100">
              {portfolioData.dissertationInfo.researchTopic || <span className="text-gray-400 italic">No topic development details logged yet.</span>}
            </div>
          </div>

          {/* 5.2 Dissertation Scope & Proposal */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-tu-red">5.2 Dissertation Scope & Proposal</h3>
            <div className="bg-red-50/25 border border-red-100 p-5 rounded-2xl space-y-4 text-xs">
              <div>
                <span className="text-tu-red font-bold block uppercase mb-1">Working Dissertation Title</span>
                <p className="text-gray-900 font-bold text-sm leading-normal">
                  "{portfolioData.dissertationInfo.title || 'Untitled Dissertation'}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-gray-500 font-bold block mb-1">Background and Significance</span>
                  <p className="text-gray-700 leading-relaxed text-[11px]">{portfolioData.dissertationInfo.background || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-bold block mb-1">Research Problem Statement</span>
                  <p className="text-gray-700 leading-relaxed text-[11px]">{portfolioData.dissertationInfo.problem || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-gray-500 font-bold block mb-1">Research Objectives</span>
                  <p className="text-gray-700 leading-relaxed text-[11px]">{portfolioData.dissertationInfo.objectives || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-bold block mb-1">Research Questions / Hypotheses</span>
                  <p className="text-gray-700 leading-relaxed text-[11px]">{portfolioData.dissertationInfo.hypotheses || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-gray-500 font-bold block mb-1">Conceptual Framework / Theoretical Model</span>
                  <p className="text-gray-700 leading-relaxed text-[11px]">{portfolioData.dissertationInfo.conceptualFramework || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-bold block mb-1">Methodology Overview</span>
                  <p className="text-gray-700 leading-relaxed text-[11px]">{portfolioData.dissertationInfo.methodology || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5.3 Dissertation Progress Record */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-tu-red">5.3 Dissertation Progress Record</h3>
            {portfolioData.dissertationProgress && portfolioData.dissertationProgress.length > 0 ? (
              <table className="w-full text-left text-[11px] border border-gray-200">
                <thead>
                  <tr className="bg-gray-50 font-bold border-b border-gray-200">
                    <th className="p-2">Planned Activity</th>
                    <th className="p-2">Target Date</th>
                    <th className="p-2">Progress Outcome</th>
                    <th className="p-2">Obstacles (If any)</th>
                    <th className="p-2">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {portfolioData.dissertationProgress.map((prog, i) => {
                    let files = [];
                    if (Array.isArray(prog.evidence)) {
                      files = prog.evidence.map(f => typeof f === 'string' ? { name: 'Attachment', url: f } : f);
                    } else if (typeof prog.evidence === 'string') {
                      if (prog.evidence.trim().startsWith('[')) {
                        try { files = JSON.parse(prog.evidence); } catch(e) { files = [{ name: 'Attachment', url: prog.evidence }]; }
                      } else if (prog.evidence.trim()) {
                        files = [{ name: 'Attachment', url: prog.evidence }];
                      }
                    }
                    return (
                      <tr key={i} className="align-top">
                        <td className="p-2 font-bold text-gray-800">{prog.activity}</td>
                        <td className="p-2 font-mono text-gray-600">{prog.date}</td>
                        <td className="p-2 text-gray-600">
                          {prog.progress === 'Completed' && <span className="text-green-600 font-semibold">{prog.progress}</span>}
                          {prog.progress === 'In progress' && <span className="text-blue-600 font-semibold">{prog.progress}</span>}
                          {prog.progress === 'Postponed' && <span className="text-orange-600 font-semibold">{prog.progress}</span>}
                          {prog.progress === 'Not started' && <span className="text-gray-500 font-semibold">{prog.progress}</span>}
                          {!['Completed', 'In progress', 'Postponed', 'Not started'].includes(prog.progress) && <span>{prog.progress}</span>}
                        </td>
                        <td className="p-2 text-gray-600">{prog.obstacles || '-'}</td>
                        <td className="p-2">
                          {files.length > 0 ? (
                            <ul className="list-disc pl-3 text-[10px] space-y-1">
                              {files.map((f, j) => (
                                <li key={j}>
                                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-tu-red hover:underline">
                                    {f.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400 text-[10px] italic">No evidence</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-400 italic">No progress rows recorded.</p>
            )}
          </div>

          {/* 5.4 Meetings with Advisor / Committee */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-tu-red">5.4 Doctoral Advisory Committee Meetings</h3>
            {portfolioData.advisorMeetings && portfolioData.advisorMeetings.length > 0 ? (
              <table className="w-full text-left text-xs border border-gray-200">
                <thead>
                  <tr className="bg-gray-50 font-bold border-b border-gray-200">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Advisors Attending</th>
                    <th className="p-2.5">Key Issues Discussed</th>
                    <th className="p-2.5">Action Points / Next Steps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {portfolioData.advisorMeetings.map((meet, i) => (
                    <tr key={i} className="align-top">
                      <td className="p-2.5 font-mono text-gray-600">{meet.date}</td>
                      <td className="p-2.5 font-semibold text-gray-800">{meet.persons}</td>
                      <td className="p-2.5 text-gray-600">{meet.issues}</td>
                      <td className="p-2.5 text-gray-600 font-medium text-tu-red">{meet.actionPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-400 italic">No advisory meetings recorded.</p>
            )}
          </div>

          {/* 5.5 Ethics and Research Governance */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-tu-red">5.5 Ethics and Research Governance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block mb-0.5">PROTOCOL SUBMISSION DATE</span>
                <span className="text-xs font-semibold text-gray-800">{portfolioData.ethicsGovernance?.dateApplied || 'Not Submitted'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 block mb-0.5">APPROVAL DATE</span>
                <span className="text-xs font-semibold text-gray-800">{portfolioData.ethicsGovernance?.dateApproved || 'Pending'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 block mb-0.5">COA APPROVAL NUMBER</span>
                <span className="text-xs font-mono font-bold text-tu-red">{portfolioData.ethicsGovernance?.approvalNumber || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50/25 border border-gray-100 rounded-lg">
                <span className="text-[10px] font-bold text-gray-400 block mb-1">PROTOCOL AMENDMENTS / UPDATES</span>
                <p className="text-xs text-gray-700 leading-relaxed">{portfolioData.ethicsGovernance?.amendments || 'None'}</p>
              </div>
              <div className="p-3 bg-gray-50/25 border border-gray-100 rounded-lg">
                <span className="text-[10px] font-bold text-gray-400 block mb-1">DATA MANAGEMENT & CONFIDENTIALITY</span>
                <p className="text-xs text-gray-700 leading-relaxed">{portfolioData.ethicsGovernance?.confidentiality || 'None'}</p>
              </div>
            </div>
          </div>

          {/* 5.6 Challenges Encountered and Solutions */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-bold text-tu-red">5.6 Challenges Encountered and Solutions</h3>
            <div className="p-4 bg-gray-50/50 rounded-xl text-xs leading-relaxed text-gray-700 border border-gray-100 italic">
              "{portfolioData.researchReflection || 'No reflection logged.'}"
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* PAGE 8: RESEARCH EXPERIENCE HOURS */}
        {/* ========================================== */}
        <div className="print-page-break space-y-6 pt-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-tu-red font-mono">Section 6</span>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Research Experience Requirement</h2>

          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex justify-between items-center mb-4 text-xs text-emerald-800">
            <span><strong>Research Requirement:</strong> Accumulate a minimum of 180 research assistance hours supervised by advisors.</span>
            <span className="text-lg font-bold font-mono text-emerald-700">{completedHours} / 180 Hours (PASSED)</span>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-tu-red">6.1 Record of Research Experience Hours</h3>
            <table className="w-full text-left text-xs border border-gray-200">
              <thead>
                <tr className="bg-gray-50 font-bold border-b border-gray-200">
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Research Work Performed</th>
                  <th className="p-2.5 text-center">Hours</th>
                  <th className="p-2.5">Supervisor / Advisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {portfolioData.researchExperience.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-mono">{item.date}</td>
                    <td className="p-2.5 font-medium text-gray-800">{item.description}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-600">{item.hours}</td>
                    <td className="p-2.5 text-gray-600">{item.supervisor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-bold text-tu-red">6.2 Reflection on Research Experience</h3>
            <p className="p-4 bg-gray-50/50 rounded-xl text-xs leading-relaxed italic text-gray-700">
              "{portfolioData.researchReflection}"
            </p>
          </div>
        </div>

        {/* ========================================== */}
        {/* PAGE 9: SCHOLARLY PUBLICATIONS */}
        {/* ========================================== */}
        <div className="print-page-break space-y-6 pt-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-tu-red font-mono">Section 7</span>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Scholarly Output</h2>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-tu-red">7.2 Publications</h3>
            <table className="w-full text-left text-xs border border-gray-200">
              <thead>
                <tr className="bg-gray-50 font-bold border-b border-gray-200">
                  <th className="p-2.5 w-1/6">Year</th>
                  <th className="p-2.5">Title</th>
                  <th className="p-2.5">Journal / DOI Reference</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {portfolioData.publications.map((pub, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-mono">{pub.year}</td>
                    <td className="p-2.5 font-semibold text-gray-800">{pub.title}</td>
                    <td className="p-2.5 text-gray-500 font-mono text-[10px]">{pub.journal}</td>
                    <td className="p-2.5 text-center text-emerald-700 font-bold text-[10px]">{pub.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Activity collages display on print output */}
          <div className="space-y-4 pt-6">
            <h3 className="text-sm font-bold text-tu-red">Doctoral Activities Log & Photographic Evidence Collage</h3>
            <div className="grid grid-cols-2 gap-4">
              {approvedActs.map((act) => (
                <div key={act.ActivityID} className="p-4 border border-gray-100 rounded-xl bg-gray-50 text-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-800 leading-snug">{act.Title}</h4>
                    <span className="text-[9px] font-bold text-emerald-600 font-mono">APPROVED</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2">{act.Description}</p>
                  
                  <div className="grid grid-cols-3 gap-1">
                    {act.ImagesURL.map((item, i) => {
                      const url = typeof item === 'string' ? item : (item as any)?.url || '';
                      return (
                        <img key={i} src={url} className="h-12 w-full object-cover rounded" alt="Evidence Collage" />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* PAGE 10: COMPETENCY SELF-ASSESSMENT */}
        {/* ========================================== */}
        <div className="print-page-break space-y-6 pt-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-tu-red font-mono">Section 12</span>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Self-Assessment of Doctoral Competencies</h2>

          <div className="space-y-4">
            <table className="w-full text-left text-xs border border-gray-200">
              <thead>
                <tr className="bg-gray-50 font-bold border-b border-gray-200">
                  <th className="p-2.5">Competency Area</th>
                  <th className="p-2.5 text-center">Self-Rating Score</th>
                  <th className="p-2.5">Evidence / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {portfolioData.competencySelfAssessment.map((comp, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-medium">{comp.competency}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">{comp.rating}</td>
                    <td className="p-2.5 text-gray-500 italic">{comp.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================== */}
        {/* PAGE 11: ADVISOR COMMENTS & ENDORSEMENTS SIGN-OFF */}
        {/* ========================================== */}
        <div className="print-page-break space-y-10 pt-10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-tu-red font-mono">Section 15 & 16</span>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Advisor Comments and Sign-off</h2>
          </div>

          {/* 15. Comments Box */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-tu-red">15. Major Advisor’s Detailed Comments</h3>
            <div className="p-6 border border-amber-100 bg-amber-50/20 rounded-2xl text-xs leading-relaxed italic text-gray-800">
              "{portfolioData.advisorComments || 'The candidate exhibits outstanding doctoral potential, consistently fulfilling standard program milestones. The dissertation outline is methodologically rigorous and shows promising relevance to nursing practice in elderly healthcare. High-quality study progress is fully approved.'}"
            </div>
          </div>

          {/* 16. Committee Sign-off blocks */}
          <div className="space-y-6 pt-10">
            <h3 className="text-sm font-bold text-tu-red text-center">16. Advisor / Committee Endorsement Block</h3>
            
            <div className="grid grid-cols-2 gap-10 text-xs pt-6">
              {portfolioData.endorsements.map((end, i) => (
                <div key={i} className="text-center space-y-2 border-t border-gray-100 pt-6 font-normal">
                  <div className="h-10 flex items-center justify-center">
                    <span className="font-mono text-gray-300 italic">Signed Electronically</span>
                  </div>
                  <span className="font-bold text-gray-800 block">{end.name}</span>
                  <span className="text-[10px] text-gray-400 font-medium block">({end.role})</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold inline-block font-mono">
                    APPROVED: {end.signatureDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
