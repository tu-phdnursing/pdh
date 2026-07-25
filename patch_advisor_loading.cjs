const fs = require('fs');
let content = fs.readFileSync('src/components/AdvisorPanel.tsx', 'utf8');

const target1 = `  const [selectedStudentPortfolio, setSelectedStudentPortfolio] = useState<StudentPortfolioData | null>(null);`;
const replace1 = `  const [selectedStudentPortfolio, setSelectedStudentPortfolio] = useState<StudentPortfolioData | null>(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);`;

if (!content.includes('isLoadingPortfolio')) {
  content = content.replace(target1, replace1);
}

const target2 = `                  setSelectedStudent(stud);
                  setSelectedStudentPortfolio(null);
                  getStudentPortfolio(stud.StudentID || '').then(port => setSelectedStudentPortfolio(port));
                  setFeedbackText('');`;
const replace2 = `                  setSelectedStudent(stud);
                  setSelectedStudentPortfolio(null);
                  setIsLoadingPortfolio(true);
                  getStudentPortfolio(stud.StudentID || '').then(port => {
                    setSelectedStudentPortfolio(port);
                    setIsLoadingPortfolio(false);
                  });
                  setFeedbackText('');`;
content = content.replace(target2, replace2);

const target3 = `            <div className="flex border-b border-gray-200 no-print">`;
const replace3 = `            {isLoadingPortfolio && (
              <div className="flex items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-xs mb-6">
                <Loader2 className="animate-spin text-tu-red mr-2" size={24} />
                <span className="text-sm font-semibold text-gray-600">Loading student data...</span>
              </div>
            )}
            {!isLoadingPortfolio && (
              <>
            <div className="flex border-b border-gray-200 no-print">`;

content = content.replace(target3, replace3);

const target4 = `              {activeTab === 'portfolio' && selectedStudentPortfolio && (
                <AdvisorDissertationView
                  student={activeStudent}
                  portfolio={selectedStudentPortfolio}
                />
              )}
            </AnimatePresence>
          </>`;
const replace4 = `              {activeTab === 'portfolio' && selectedStudentPortfolio && (
                <AdvisorDissertationView
                  student={activeStudent}
                  portfolio={selectedStudentPortfolio}
                />
              )}
            </AnimatePresence>
            </>
          )}
          </>`;

content = content.replace(target4, replace4);

fs.writeFileSync('src/components/AdvisorPanel.tsx', content);
console.log("Done");
