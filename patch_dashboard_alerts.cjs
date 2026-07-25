const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const importTarget = `import { Award, BookOpen, Clock, CheckCircle2, AlertCircle, FileText, Users, Settings, Plus, GraduationCap } from 'lucide-react';`;
const importReplacement = `import { Award, BookOpen, Clock, CheckCircle2, AlertCircle, FileText, Users, Settings, Plus, GraduationCap, BellRing } from 'lucide-react';`;
content = content.replace(importTarget, importReplacement);

// Find the start of the return for STUDENT
const renderTarget = `  return (
    <div className="space-y-6">`;

const renderReplacement = `  // Calculate delayed dissertation progress
  const delayedProgress = (portfolioData?.dissertationProgress || []).filter(prog => {
    if (prog.progress === 'Completed' || !prog.date) return false;
    // prog.date is YYYY-MM
    const [year, month] = prog.date.split('-');
    if (!year || !month) return false;
    const targetDate = new Date(parseInt(year), parseInt(month) - 1);
    const currentDate = new Date();
    // Compare YYYY-MM directly
    const targetMonthStr = \`\${targetDate.getFullYear()}-\${String(targetDate.getMonth() + 1).padStart(2, '0')}\`;
    const currentMonthStr = \`\${currentDate.getFullYear()}-\${String(currentDate.getMonth() + 1).padStart(2, '0')}\`;
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
      )}`;
      
content = content.replace(renderTarget, renderReplacement);
fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log("Done");
