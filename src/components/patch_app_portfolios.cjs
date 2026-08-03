const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `const [studentPortfolio, setStudentPortfolio] = useState<StudentPortfolioData | null>(null);`;
const replacement1 = `const [studentPortfolio, setStudentPortfolio] = useState<StudentPortfolioData | null>(null);
  const [allPortfolios, setAllPortfolios] = useState<{studentId: string, portfolio: StudentPortfolioData}[]>([]);`;

if (!content.includes('allPortfolios')) {
  content = content.replace(target1, replacement1);
}

const target2 = `import {
  initializeDatabase,
  getUsers,
  getCertificates,
  getActivities,
  getConfigOptions,
  getStudentPortfolio,
  saveStudentPortfolio,`;

const replacement2 = `import {
  initializeDatabase,
  getUsers,
  getCertificates,
  getActivities,
  getConfigOptions,
  getStudentPortfolio,
  getAllPortfolios,
  saveStudentPortfolio,`;
  
if (!content.includes('getAllPortfolios')) {
  content = content.replace(target2, replacement2);
}

const target3 = `        const port = await getStudentPortfolio(currentUser.StudentID || '6601010024');
        setStudentPortfolio(port);
      } else if (fetchedUsers.length > 0 && currentUser) {`;

const replacement3 = `        const port = await getStudentPortfolio(currentUser.StudentID || '6601010024');
        setStudentPortfolio(port);
      } else if (fetchedUsers.length > 0 && currentUser) {
        if (currentUser.Role === 'ADVISOR' || currentUser.Role === 'ADMIN' || currentUser.Role === 'SUPER_ADVISOR' || currentUser.Role === 'CO_ADVISOR') {
          const allP = await getAllPortfolios();
          setAllPortfolios(allP);
        }`;

if (!content.includes('setAllPortfolios(allP)')) {
  content = content.replace(target3, replacement3);
}

const target4 = `<Dashboard
                  currentUser={currentUser}
                  certificates={certificates}
                  activities={activities}
                  portfolioData={studentPortfolio || {`;

const replacement4 = `<Dashboard
                  currentUser={currentUser}
                  certificates={certificates}
                  activities={activities}
                  allPortfolios={allPortfolios}
                  portfolioData={studentPortfolio || {`;
                  
if (!content.includes('allPortfolios={allPortfolios}')) {
  content = content.replace(target4, replacement4);
}

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
