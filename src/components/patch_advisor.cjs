const fs = require('fs');
let content = fs.readFileSync('src/components/AdvisorPanel.tsx', 'utf8');

if (!content.includes('import StudentProgressDashboard')) {
  content = content.replace(
    "import StudentInformation from './StudentInformation';",
    "import StudentInformation from './StudentInformation';\nimport StudentProgressDashboard from './StudentProgressDashboard';"
  );
}

const targetStart = `<div className="lg:col-span-1 space-y-4 no-print">`;
const replacementStart = `<div className="lg:col-span-1 space-y-4 no-print">
        <button
          onClick={() => {
            setSelectedStudent(null);
            setSelectedStudentPortfolio(null);
          }}
          className={\`w-full text-left p-3 rounded-xl transition duration-200 flex items-center gap-3 border cursor-pointer \${
            !selectedStudent
              ? 'bg-red-50/50 border-red-100 text-tu-red'
              : 'border-transparent text-gray-700 bg-white hover:bg-gray-50'
          }\`}
        >
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-tu-red"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
          </div>
          <div>
            <div className="font-bold text-sm">Progress Dashboard</div>
            <div className="text-[10px] opacity-75">All Supervised Students</div>
          </div>
        </button>
`;

if (!content.includes('Progress Dashboard')) {
  content = content.replace(targetStart, replacementStart);
}

const renderStart = `{/* Right content area */}`;
const renderReplace = `{/* Right content area */}
      <div className="lg:col-span-3">
        {!selectedStudent ? (
          <StudentProgressDashboard students={myStudents} />
        ) : activeStudent ? (`;
        
const renderEnd = `        ) : (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Users size={24} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">No Supervised Students Assigned</h3>
            <p className="text-xs text-gray-500 mt-1">Configure student accounts to list you as their Major Advisor or Co-Advisor in the demographics section.</p>
          </div>
        )}
      </div>`;

if (!content.includes('<StudentProgressDashboard')) {
  content = content.replace(`{/* Right content area */}
      <div className="lg:col-span-3">
        {activeStudent ? (`, renderReplace);
}

fs.writeFileSync('src/components/AdvisorPanel.tsx', content);
console.log("Done");
