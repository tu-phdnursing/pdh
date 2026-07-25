const fs = require('fs');
let content = fs.readFileSync('src/components/AdvisorPanel.tsx', 'utf8');

content = content.replace(/<EditPortfolio\\n                    currentUser=\{activeStudent\}\\n                    initialSection=\{5\}/, '<EditPortfolio\n                    currentUser={activeStudent}\n                    initialSection={5}');

fs.writeFileSync('src/components/AdvisorPanel.tsx', content);
console.log("Done");
