const fs = require('fs');
const content = fs.readFileSync('src/components/StudentProgressDashboard.tsx', 'utf8');

const targetFilters = `      {/* Filters */}`;

const replacement = `      {/* Overdue Alerts */}
      {(() => {
        const overdue = [];
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        filteredStudents.forEach(stud => {
          const port = stud.StudentID ? portfolios[stud.StudentID] : null;
          if (!port || !port.dissertationProgress) return;

          port.dissertationProgress.forEach(prog => {
            if (prog.progress === 'Completed') return;
            if (!prog.date) return;
            
            const [y, m] = prog.date.split('-');
            if (y && m) {
              const year = parseInt(y, 10);
              const month = parseInt(m, 10);
              if (year < currentYear || (year === currentYear && month < currentMonth)) {
                overdue.push({
                  student: stud.FullName,
                  activity: prog.activity,
                  date: prog.date
                });
              }
            }
          });
        });

        if (overdue.length === 0) return null;

        return (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-red-800 flex items-center gap-1.5 mb-2">
              <AlertCircle size={16} />
              Overdue Notifications ({overdue.length})
            </h3>
            <ul className="space-y-1">
              {overdue.map((od, idx) => (
                <li key={idx} className="text-xs text-red-700">
                  <span className="font-semibold">{od.student}</span>: {od.activity} (Target: {od.date})
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {/* Filters */}`;

const newContent = content.replace(targetFilters, replacement);
fs.writeFileSync('src/components/StudentProgressDashboard.tsx', newContent);
console.log("Done");
