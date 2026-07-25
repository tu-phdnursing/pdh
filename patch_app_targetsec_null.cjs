const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/if \(sectionId\) \{\s*setTargetSection\(sectionId\);\s*\}/, 'setTargetSection(sectionId || null);');

fs.writeFileSync('src/App.tsx', content);
