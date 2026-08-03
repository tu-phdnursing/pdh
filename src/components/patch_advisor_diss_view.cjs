const fs = require('fs');
let content = fs.readFileSync('src/components/AdvisorPanel.tsx', 'utf8');

const importTarget = `import EditPortfolio from './EditPortfolio';`;
const importReplace = `import EditPortfolio from './EditPortfolio';\nimport AdvisorDissertationView from './AdvisorDissertationView';`;
if (!content.includes('AdvisorDissertationView')) {
  content = content.replace(importTarget, importReplace);
}

const renderTarget = `{activeTab === 'portfolio' && selectedStudentPortfolio && (
                <div className="space-y-4 bg-white p-2 rounded-2xl">
                  <EditPortfolio
                    currentUser={activeStudent}
                    initialSection={5}
                    portfolioData={selectedStudentPortfolio}
                    certificates={certificates}
                    configOptions={[]}
                    onSavePortfolio={async () => {}}
                    isReadOnly={true}
                  />
                </div>
              )}`;
const renderReplace = `{activeTab === 'portfolio' && selectedStudentPortfolio && (
                <AdvisorDissertationView
                  student={activeStudent}
                  portfolio={selectedStudentPortfolio}
                />
              )}`;
content = content.replace(renderTarget, renderReplace);

fs.writeFileSync('src/components/AdvisorPanel.tsx', content);
console.log("Done");
