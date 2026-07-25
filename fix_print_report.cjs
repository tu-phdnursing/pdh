const fs = require('fs');
let content = fs.readFileSync('src/components/PrintReport.tsx', 'utf8');

content = content.replace(
  `<td className="py-2.5 text-gray-800">{currentUser.DateOfSubmission || 'Not specified'}</td>`,
  `<td className="py-2.5 text-gray-800">{formatDisplayDate(currentUser.DateOfSubmission) || 'Not specified'}</td>`
);

content = content.replace(
  `<span className="font-semibold text-gray-800">{currentUser.DateOfSubmission || 'N/A'}</span>`,
  `<span className="font-semibold text-gray-800">{formatDisplayDate(currentUser.DateOfSubmission) || 'N/A'}</span>`
);

fs.writeFileSync('src/components/PrintReport.tsx', content);
