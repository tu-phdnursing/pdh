const fs = require('fs');
let content = fs.readFileSync('src/components/AdvisorPanel.tsx', 'utf8');

const target = `<StudentProgressDashboard students={myStudents} />`;
const replace = `<StudentProgressDashboard students={myStudents} onSelectStudent={(stud) => {
            setSelectedStudent(stud);
            setSelectedStudentPortfolio(null);
            getStudentPortfolio(stud.StudentID || '').then(port => setSelectedStudentPortfolio(port));
            setFeedbackText('');
          }} />`;

content = content.replace(target, replace);
fs.writeFileSync('src/components/AdvisorPanel.tsx', content);
console.log("Done");
