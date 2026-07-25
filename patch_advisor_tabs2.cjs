const fs = require('fs');
let content = fs.readFileSync('src/components/AdvisorPanel.tsx', 'utf8');

content = content.replace(/>\s*Student Demographics\s*<\/button>/, '> View Full Profile </button>');
content = content.replace(/>\s*Full Portfolio \(16 Sections\)\s*<\/button>/, '> Dissertation Progress Record </button>');
content = content.replace(/<EditPortfolio\n                    currentUser=\{activeStudent\}/, '<EditPortfolio\\n                    currentUser={activeStudent}\\n                    initialSection={5}');

fs.writeFileSync('src/components/AdvisorPanel.tsx', content);
console.log("Done");
