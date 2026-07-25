const fs = require('fs');
let content = fs.readFileSync('src/lib/googleSheets.ts', 'utf8');

// For P4
content = content.replace(
  `semester: r.Semester || "",`,
  `semester: formatDate(r.Semester, true) || "",`
);

// For P8
content = content.replace(
  `semester: r.TeachSemester || "",`,
  `semester: formatDate(r.TeachSemester, true) || "",`
);

fs.writeFileSync('src/lib/googleSheets.ts', content);
console.log('Replaced successfully');
