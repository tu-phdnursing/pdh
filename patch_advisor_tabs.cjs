const fs = require('fs');
let content = fs.readFileSync('src/components/AdvisorPanel.tsx', 'utf8');

// Change initial state
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'certs' | 'activities' | 'profile' | 'portfolio'>('certs');",
  "const [activeTab, setActiveTab] = useState<'certs' | 'activities' | 'profile' | 'portfolio'>('profile');"
);

// Reorder tabs
const targetTabs = `<div className="flex border-b border-gray-200 no-print">
              <button
                onClick={() => setActiveTab('certs')}
                className={\`flex items-center gap-2 px-6 py-2.5 border-b-2 font-medium text-xs transition-all duration-200 cursor-pointer \${
                  activeTab === 'certs'
                    ? 'border-tu-red text-tu-red font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }\`}
              >
                <Award size={14} />
                Review Certificates ({certificates.filter(c => c.StudentID === activeStudent.StudentID && c.Status === 'PENDING').length} Pending)
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={\`flex items-center gap-2 px-6 py-2.5 border-b-2 font-medium text-xs transition-all duration-200 cursor-pointer \${
                  activeTab === 'activities'
                    ? 'border-tu-red text-tu-red font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }\`}
              >
                <Clock size={14} />
                Review Activities ({activities.filter(a => a.StudentID === activeStudent.StudentID && a.Status === 'PENDING').length} Pending)
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={\`flex items-center gap-2 px-6 py-2.5 border-b-2 font-medium text-xs transition-all duration-200 cursor-pointer \${
                  activeTab === 'profile'
                    ? 'border-tu-red text-tu-red font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }\`}
              >
                <Users size={14} /> View Full Profile </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={\`flex items-center gap-2 px-6 py-2.5 border-b-2 font-medium text-xs transition-all duration-200 cursor-pointer \${
                  activeTab === 'portfolio'
                    ? 'border-tu-red text-tu-red font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }\`}
              >
                <FileText size={14} /> Dissertation Progress Record </button>
            </div>`;

const replaceTabs = `<div className="flex border-b border-gray-200 no-print">
              <button
                onClick={() => setActiveTab('profile')}
                className={\`flex items-center gap-2 px-6 py-2.5 border-b-2 font-medium text-xs transition-all duration-200 cursor-pointer \${
                  activeTab === 'profile'
                    ? 'border-tu-red text-tu-red font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }\`}
              >
                <Users size={14} /> View Full Profile </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={\`flex items-center gap-2 px-6 py-2.5 border-b-2 font-medium text-xs transition-all duration-200 cursor-pointer \${
                  activeTab === 'portfolio'
                    ? 'border-tu-red text-tu-red font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }\`}
              >
                <FileText size={14} /> Dissertation Progress Record </button>
              <button
                onClick={() => setActiveTab('certs')}
                className={\`flex items-center gap-2 px-6 py-2.5 border-b-2 font-medium text-xs transition-all duration-200 cursor-pointer \${
                  activeTab === 'certs'
                    ? 'border-tu-red text-tu-red font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }\`}
              >
                <Award size={14} />
                Review Certificates ({certificates.filter(c => c.StudentID === activeStudent.StudentID && c.Status === 'PENDING').length} Pending)
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={\`flex items-center gap-2 px-6 py-2.5 border-b-2 font-medium text-xs transition-all duration-200 cursor-pointer \${
                  activeTab === 'activities'
                    ? 'border-tu-red text-tu-red font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }\`}
              >
                <Clock size={14} />
                Review Activities ({activities.filter(a => a.StudentID === activeStudent.StudentID && a.Status === 'PENDING').length} Pending)
              </button>
            </div>`;

content = content.replace(targetTabs, replaceTabs);
fs.writeFileSync('src/components/AdvisorPanel.tsx', content);
console.log("Tabs reordered.");
