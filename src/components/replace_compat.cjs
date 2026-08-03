const fs = require('fs');
let content = fs.readFileSync('src/lib/googleSheets.ts', 'utf8');

// Replace new properties with a fallback to old properties
content = content.replace(/r\.MilestoneLabel_CourseTitle_Competency/g, '(r.MilestoneLabel_CourseTitle_Competency || r.MilestoneLabel)');
content = content.replace(/r\.PlannedDate_Semester_TargetDate/g, '(r.PlannedDate_Semester_TargetDate || r.PlannedDate)');
content = content.replace(/r\.ActualDate_CourseCode_Activities/g, '(r.ActualDate_CourseCode_Activities || r.ActualDate)');
content = content.replace(/r\.Remarks_Credits_Description/g, '(r.Remarks_Credits_Description || r.Remarks)');

fs.writeFileSync('src/lib/googleSheets.ts', content);
console.log('Replaced successfully');
