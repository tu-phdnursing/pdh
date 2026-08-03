const fs = require('fs');
let content = fs.readFileSync('src/lib/googleSheets.ts', 'utf8');

content = content.replace(
  /function formatDate\(val\) {[\s\S]*?return String\(val\)\.trim\(\);\s*}/g,
  `function formatDate(val, isSemester) {
    if (!val) return "";
    if (val instanceof Date) {
      var y = val.getFullYear();
      var m = val.getMonth() + 1;
      if (isSemester) {
        return m + "/" + y;
      }
      var strM = ("0" + m).slice(-2);
      var d = ("0" + val.getDate()).slice(-2);
      return y + "-" + strM + "-" + d;
    }
    return String(val).trim();
  }`
);

// Update calls to formatDate for program courses (which pass 'semester' as PlannedDate)
content = content.replace(
  `semester: formatDate(r.PlannedDate_Semester_TargetDate),`,
  `semester: formatDate(r.PlannedDate_Semester_TargetDate, true),`
);

fs.writeFileSync('src/lib/googleSheets.ts', content);
console.log('Replaced successfully');
