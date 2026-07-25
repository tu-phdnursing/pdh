const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const targetStr = `        {/* Quick Advisor Panel Redirection */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">`;

// Build the logic to aggregate dissertation progress
const newWidgetStr = `
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
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">`;

content = content.replace(targetStr, newWidgetStr);

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log("Done");
