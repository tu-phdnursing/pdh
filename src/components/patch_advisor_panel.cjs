const fs = require('fs');
let content = fs.readFileSync('src/components/AdvisorPanel.tsx', 'utf8');

content = content.replace(
  'const activeStudent = selectedStudent || myStudents[0];',
  'const activeStudent = selectedStudent;'
);

const renderTarget = `        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-xs">
            <Users className="mx-auto text-gray-300 mb-3" size={40} />
            <h3 className="font-bold text-gray-800 text-sm">No Supervised Students Assigned</h3>
            <p className="text-xs text-gray-500 mt-1">Configure student accounts to list you as their Major Advisor or Co-Advisor in the demographics section.</p>
          </div>
        )}`;

const newRender = `        ) : myStudents.length > 0 ? (
          <StudentProgressDashboard students={myStudents} />
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-xs">
            <Users className="mx-auto text-gray-300 mb-3" size={40} />
            <h3 className="font-bold text-gray-800 text-sm">No Supervised Students Assigned</h3>
            <p className="text-xs text-gray-500 mt-1">Configure student accounts to list you as their Major Advisor or Co-Advisor in the demographics section.</p>
          </div>
        )}`;

content = content.replace(renderTarget, newRender);

fs.writeFileSync('src/components/AdvisorPanel.tsx', content);
console.log("Done");
