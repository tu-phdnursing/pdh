const fs = require('fs');
let content = fs.readFileSync('src/components/EditPortfolio.tsx', 'utf8');

const target1 = `  certificates: Certificate[];
}`;
const replacement1 = `  certificates: Certificate[];
  initialSection?: number | null;
}`;
content = content.replace(target1, replacement1);

const target2 = `  certificates
}: EditPortfolioProps) {
  const [formData, setFormData] = useState<StudentPortfolioData>(portfolioData);
  const [activeSection, setActiveSection] = useState<number>(1);`;
const replacement2 = `  certificates,
  initialSection
}: EditPortfolioProps) {
  const [formData, setFormData] = useState<StudentPortfolioData>(portfolioData);
  const [activeSection, setActiveSection] = useState<number>(initialSection || 1);
  
  React.useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);`;

content = content.replace(target2, replacement2);

fs.writeFileSync('src/components/EditPortfolio.tsx', content);
console.log("Done");
