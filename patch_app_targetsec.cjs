const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `  const [activeTab, setActiveTab] = useState<string>('dashboard');`;
const replacement1 = `  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [targetSection, setTargetSection] = useState<number | null>(null);`;

if (!content.includes('targetSection')) {
  content = content.replace(target1, replacement1);
}

const target2 = `onNavigate={(tab) => setActiveTab(tab)}`;
const replacement2 = `onNavigate={(tab, sectionId) => {
                    setActiveTab(tab);
                    if (sectionId) {
                      setTargetSection(sectionId);
                    }
                  }}`;

content = content.replace(target2, replacement2);

const target3 = `currentUser={currentUser}
                  portfolioData={studentPortfolio}
                  onSavePortfolio={handleSavePortfolio}
                  configOptions={configOptions}
                  certificates={certificates}`;
const replacement3 = `currentUser={currentUser}
                  portfolioData={studentPortfolio}
                  onSavePortfolio={handleSavePortfolio}
                  configOptions={configOptions}
                  certificates={certificates}
                  initialSection={targetSection}`;

content = content.replace(target3, replacement3);

const target4 = `onClick={() => setActiveTab('dashboard')}`;
const replacement4 = `onClick={() => { setActiveTab('dashboard'); setTargetSection(null); }}`;

content = content.replace(/onClick=\{\(\) \=\> setActiveTab\('dashboard'\)\}/g, replacement4);

const target5 = `onClick={() => setActiveTab('info')}`;
const replacement5 = `onClick={() => { setActiveTab('info'); setTargetSection(null); }}`;
content = content.replace(/onClick=\{\(\) \=\> setActiveTab\('info'\)\}/g, replacement5);

const target6 = `onClick={() => setActiveTab('edit')}`;
const replacement6 = `onClick={() => { setActiveTab('edit'); setTargetSection(null); }}`;
content = content.replace(/onClick=\{\(\) \=\> setActiveTab\('edit'\)\}/g, replacement6);

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
