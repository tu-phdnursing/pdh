const fs = require('fs');
let content = fs.readFileSync('src/lib/googleSheets.ts', 'utf8');

// 1. Fix appendObjectAsRow to prefix values that look like "1/2025" with a single quote
content = content.replace(
  `function appendObjectAsRow(sheet, headers, obj) {
  var rowValues = headers.map(function(h) {
    return obj[h] !== undefined ? obj[h] : "";
  });
  sheet.appendRow(rowValues);
}`,
  `function appendObjectAsRow(sheet, headers, obj) {
  var rowValues = headers.map(function(h) {
    var val = obj[h] !== undefined ? obj[h] : "";
    if (typeof val === 'string' && /^[123]\\/\\d{4}$/.test(val)) {
      return "'" + val; // Prevent Google Sheets from formatting as Date
    }
    return val;
  });
  sheet.appendRow(rowValues);
}`
);

// 2. Change the header array for P2_Milestones so they represent the shared data better
content = content.replace(
  `"P2_Milestones": ["StudentID", "MilestoneKey", "MilestoneLabel", "PlannedDate", "ActualDate", "Remarks", "Status", "LastUpdated"],`,
  `"P2_Milestones": ["StudentID", "MilestoneKey", "MilestoneLabel_CourseTitle_Competency", "PlannedDate_Semester_TargetDate", "ActualDate_CourseCode_Activities", "Remarks_Credits_Description", "Status", "LastUpdated"],`
);

content = content.replace(
  `"P2_Milestones": ["StudentID", "MilestoneKey", "MilestoneLabel", "PlannedDate", "ActualDate", "Remarks", "Status", "LastUpdated"],`,
  `"P2_Milestones": ["StudentID", "MilestoneKey", "MilestoneLabel_CourseTitle_Competency", "PlannedDate_Semester_TargetDate", "ActualDate_CourseCode_Activities", "Remarks_Credits_Description", "Status", "LastUpdated"],`
);


// 3. Fix the reading of P2_Milestones to use the new headers
// In getPortfolioByStudentId, it reads the data into an object array.
// findRowsByStudentID uses getRange and getValues, and uses the first row as keys.
// So we must update the properties it expects!
content = content.replace(/r\.MilestoneLabel/g, 'r.MilestoneLabel_CourseTitle_Competency');
content = content.replace(/r\.PlannedDate/g, 'r.PlannedDate_Semester_TargetDate');
content = content.replace(/r\.ActualDate/g, 'r.ActualDate_CourseCode_Activities');
content = content.replace(/r\.Remarks/g, 'r.Remarks_Credits_Description');

// 4. Update the writing to P2_Milestones (savePortfolioData)
content = content.replace(
  /\["StudentID", "MilestoneKey", "MilestoneLabel", "PlannedDate", "ActualDate", "Remarks", "Status", "LastUpdated"\]/g,
  `["StudentID", "MilestoneKey", "MilestoneLabel_CourseTitle_Competency", "PlannedDate_Semester_TargetDate", "ActualDate_CourseCode_Activities", "Remarks_Credits_Description", "Status", "LastUpdated"]`
);

content = content.replace(/MilestoneLabel:/g, 'MilestoneLabel_CourseTitle_Competency:');
content = content.replace(/PlannedDate:/g, 'PlannedDate_Semester_TargetDate:');
content = content.replace(/ActualDate:/g, 'ActualDate_CourseCode_Activities:');
content = content.replace(/Remarks:/g, 'Remarks_Credits_Description:');

fs.writeFileSync('src/lib/googleSheets.ts', content);
console.log('Replaced successfully');
