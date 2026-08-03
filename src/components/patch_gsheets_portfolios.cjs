const fs = require('fs');
let content = fs.readFileSync('src/lib/googleSheets.ts', 'utf8');

const target = `export async function getStudentPortfolio`;
const replacement = `export async function getAllPortfolios(): Promise<{studentId: string, portfolio: StudentPortfolioData}[]> {
  initializeDatabase();
  const scriptUrl = getAppsScriptUrl();
  if (scriptUrl) {
    try {
      // In a real app we'd fetch all from Apps Script, for now we just rely on LocalStorage since this is simulation
    } catch (e) {
      console.warn('Sync all portfolios failed, falling back to LocalStorage:', e);
    }
  }
  
  const allPorts = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(KEYS.PORTFOLIO + '_') || key === KEYS.PORTFOLIO)) {
      try {
        let studentId = key.replace(KEYS.PORTFOLIO + '_', '');
        if (key === KEYS.PORTFOLIO) studentId = '6601010024'; // default mock ID
        
        const data = localStorage.getItem(key);
        if (data) {
          allPorts.push({
            studentId,
            portfolio: ensurePortfolioDefaults(JSON.parse(data))
          });
        }
      } catch (e) {
        // ignore
      }
    }
  }
  return allPorts;
}

export async function getStudentPortfolio`;

if(!content.includes('getAllPortfolios')) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/lib/googleSheets.ts', content);
  console.log("Done");
} else {
  console.log("Already added");
}
