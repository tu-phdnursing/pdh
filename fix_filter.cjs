const fs = require('fs');
let content = fs.readFileSync('src/components/StudentProgressDashboard.tsx', 'utf8');

const target = `    if (yearFilter && !(s.YearOfAdmission || '').toLowerCase().includes(yearFilter.toLowerCase())) return false;`;
const replace = `    if (yearFilter && !String(s.YearOfAdmission || '').toLowerCase().includes(yearFilter.toLowerCase())) return false;`;

content = content.replace(target, replace);
fs.writeFileSync('src/components/StudentProgressDashboard.tsx', content);
