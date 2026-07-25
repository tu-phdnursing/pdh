const fs = require('fs');
let content = fs.readFileSync('src/components/StudentProgressDashboard.tsx', 'utf8');

const target = `const progressList = port?.dissertationProgress || [];
              const latestProgress = progressList.length > 0 ? progressList[progressList.length - 1] : null;`;

const replace = `const progressList = port?.dissertationProgress || [];
              const today = new Date();
              const currentYear = today.getFullYear();
              const currentMonth = today.getMonth() + 1;
              
              let latestProgress = null;
              
              // Find overdue items
              const overdueItems = progressList.filter(prog => {
                if (prog.progress === 'Completed') return false;
                if (!prog.date) return false;
                const [y, m] = prog.date.split('-');
                if (y && m) {
                  const year = parseInt(y, 10);
                  const month = parseInt(m, 10);
                  return year < currentYear || (year === currentYear && month < currentMonth);
                }
                return false;
              });

              if (overdueItems.length > 0) {
                // Show the most critical overdue item
                latestProgress = overdueItems[0];
              } else {
                // If nothing is overdue, maybe they have completed everything or nothing is due yet
                // "ถ้าอันไหนยังไม่ Completed แต่ยังไม่ถึงเวลาที่กำหนดไม่ต้องนำมาแสดง"
                latestProgress = null; 
              }`;

content = content.replace(target, replace);

const renderTarget = `{latestProgress ? (
                      <span className="text-sm font-medium text-gray-700">{latestProgress.activity}</span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No progress recorded</span>
                    )}`;

const renderReplace = `{latestProgress ? (
                      <span className="text-sm font-bold text-red-600 flex items-center gap-1">
                         <AlertCircle size={14} /> {latestProgress.activity}
                      </span>
                    ) : (
                      <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                         <CheckCircle size={14} /> On Track (No overdue tasks)
                      </span>
                    )}`;

content = content.replace(renderTarget, renderReplace);

fs.writeFileSync('src/components/StudentProgressDashboard.tsx', content);
console.log("Done");
