const fs = require('fs');
const content = fs.readFileSync('src/components/StudentInformation.tsx', 'utf8');

const targetSubtab = `      {/* Subtab selection */}`;

const replacement = `      {/* Overdue Alerts */}
      {(() => {
        if (!portfolioData || !portfolioData.dissertationProgress) return null;
        
        const overdue = [];
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        portfolioData.dissertationProgress.forEach(prog => {
          if (prog.progress === 'Completed') return;
          if (!prog.date) return;
          
          const [y, m] = prog.date.split('-');
          if (y && m) {
            const year = parseInt(y, 10);
            const month = parseInt(m, 10);
            if (year < currentYear || (year === currentYear && month < currentMonth)) {
              overdue.push({
                activity: prog.activity,
                date: prog.date
              });
            }
          }
        });

        if (overdue.length === 0) return null;

        return (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-red-800 flex items-center gap-1.5 mb-2">
              <AlertCircle size={16} />
              Important: Overdue Dissertation Milestones
            </h3>
            <ul className="space-y-1 list-disc pl-8">
              {overdue.map((od, idx) => (
                <li key={idx} className="text-xs text-red-700">
                  <span className="font-semibold">{od.activity}</span> (Target: {od.date})
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {/* Subtab selection */}`;

const newContent = content.replace(targetSubtab, replacement);
fs.writeFileSync('src/components/StudentInformation.tsx', newContent);
console.log("Done");
