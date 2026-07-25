import React from 'react';
import { User, StudentPortfolioData } from '../types';
import { AlertCircle, CheckCircle, Clock, Calendar, FileText } from 'lucide-react';

interface AdvisorDissertationViewProps {
  student: User;
  portfolio: StudentPortfolioData;
}

export default function AdvisorDissertationView({ student, portfolio }: AdvisorDissertationViewProps) {
  const info: any = portfolio.dissertationInfo || {};
  const progressList = portfolio.dissertationProgress || [];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-8">
      
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-tu-red" />
          5. Dissertation Progress Record
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Detailed overview of the student's dissertation background, proposal, and progress tracking.
        </p>
      </div>

      {/* 5.1 Development of Research Topic */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-800">5.1 Development of Research Topic</h3>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
          {info.background || <span className="text-gray-400 italic">No information provided yet.</span>}
        </div>
      </div>

      {/* 5.2 Dissertation Scope & Proposal */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">5.2 Dissertation Scope & Proposal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Working Title</span>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm text-gray-800 font-medium">
              {info.title || <span className="text-gray-400 italic font-normal">Not specified</span>}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Research Topic / Area</span>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm text-gray-800">
              {info.researchTopic || <span className="text-gray-400 italic">Not specified</span>}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Problem Statement', value: info.problem },
            { label: 'Research Objectives', value: info.objectives },
            { label: 'Hypotheses / Research Questions', value: info.hypotheses },
            { label: 'Conceptual Framework', value: info.conceptualFramework },
            { label: 'Methodology / Study Design', value: info.methodology },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-xs font-bold text-gray-500">{item.label}</span>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                {item.value || <span className="text-gray-400 italic">No details provided.</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5.3 Dissertation Progress Record */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">5.3 Dissertation Progress Record</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-xs text-gray-500">
                <th className="py-3 px-4 font-bold">Milestone / Activity</th>
                <th className="py-3 px-4 font-bold">Target Date</th>
                <th className="py-3 px-4 font-bold">Progress Status</th>
                <th className="py-3 px-4 font-bold w-1/3">Obstacles & Solutions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {progressList.length > 0 ? progressList.map((prog, idx) => {
                let isOverdue = false;
                if (prog.progress !== 'Completed' && prog.date) {
                  const [y, m] = prog.date.split('-');
                  if (y && m) {
                    const today = new Date();
                    const year = parseInt(y, 10);
                    const month = parseInt(m, 10);
                    if (year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1)) {
                      isOverdue = true;
                    }
                  }
                }

                return (
                  <tr key={idx} className={`transition-colors ${isOverdue ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-sm text-gray-800">{prog.activity || '-'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-mono text-gray-600 flex items-center gap-1.5">
                        <Calendar size={14} className={isOverdue ? 'text-red-500' : 'text-gray-400'} />
                        <span className={isOverdue ? 'text-red-600 font-bold' : ''}>{prog.date || 'Not set'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit
                        ${prog.progress === 'Completed' ? 'bg-green-100 text-green-700' :
                          prog.progress === 'In progress' ? 'bg-blue-100 text-blue-700' :
                          prog.progress === 'Postponed' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'}`}
                      >
                        {prog.progress === 'Completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {prog.progress || 'Not started'}
                      </span>
                      {isOverdue && (
                        <div className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> OVERDUE
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {prog.obstacles || '-'}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 text-sm italic">
                    No progress records have been added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
