const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(/<button onClick=\{\(\) => onNavigate\('edit'\)\} className="text-tu-red font-semibold hover:underline cursor-pointer">\s*View Details\s*<\/button>/, 
  '<button onClick={() => onNavigate(\'edit\', 6)} className="text-tu-red font-semibold hover:underline cursor-pointer">\n              View Details\n            </button>');

content = content.replace(/<button onClick=\{\(\) => onNavigate\('edit'\)\} className="text-tu-gold font-semibold hover:underline cursor-pointer">\s*Milestone Map\s*<\/button>/,
  '<button onClick={() => onNavigate(\'edit\', 2)} className="text-tu-gold font-semibold hover:underline cursor-pointer">\n              Milestone Map\n            </button>');

content = content.replace(/<button onClick=\{\(\) => onNavigate\('edit'\)\} className="text-xs font-semibold text-tu-red hover:underline cursor-pointer">\s*View \/ Update Progress\s*<\/button>/,
  '<button onClick={() => onNavigate(\'edit\', 5)} className="text-xs font-semibold text-tu-red hover:underline cursor-pointer">\n            View / Update Progress\n          </button>');

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log("Done");
