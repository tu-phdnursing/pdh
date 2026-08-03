const fs = require('fs');

let content = fs.readFileSync('src/components/StudentInformation.tsx', 'utf8');

const target1 = `<span className="text-gray-800 font-medium font-mono">{currentUser.DateOfSubmission || 'Not specified'}</span>`;
const replace1 = `<span className="text-gray-800 font-medium font-mono">{formatDisplayDate(currentUser.DateOfSubmission) || 'Not specified'}</span>`;

content = content.replace(target1, replace1);
fs.writeFileSync('src/components/StudentInformation.tsx', content);
