const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(/onNavigate: \(tab: string\) => void;/g, 'onNavigate: (tab: string, sectionId?: number) => void;');
content = content.replace(/allStudents\?: User\[\];/g, 'allStudents?: User[];\n  allPortfolios?: {studentId: string, portfolio: StudentPortfolioData}[];');
content = content.replace(/allStudents = \[\],/g, 'allStudents = [],\n  allPortfolios = [],');

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log("Done");
