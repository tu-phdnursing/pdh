const fs = require('fs');
let content = fs.readFileSync('src/components/StudentProgressDashboard.tsx', 'utf8');

const target1 = `              if (year < currentYear || (year === currentYear && month < currentMonth)) {`;

const replace1 = `              if (year < currentYear || (year === currentYear && month < currentMonth)) {`;

const fullTarget = `              const overdueItems = progressList.filter(prog => {
                if (prog.progress === 'Completed') return false;
                if (!prog.date) return false;
                const [y, m] = prog.date.split('-');
                if (y && m) {
                  const year = parseInt(y, 10);
                  const month = parseInt(m, 10);
                  return year < currentYear || (year === currentYear && month < currentMonth);
                }
                return false;
              });`;

const fullReplace = `              const overdueItems = progressList.filter(prog => {
                if (prog.progress === 'Completed') return false;
                if (!prog.date) return false;
                let year, month;
                if (prog.date.includes('-')) {
                  const [y, m] = prog.date.split('-');
                  year = parseInt(y, 10);
                  month = parseInt(m, 10);
                } else {
                  const d = new Date(prog.date);
                  if (!isNaN(d.getTime())) {
                    year = d.getFullYear();
                    month = d.getMonth() + 1;
                  }
                }
                if (year && month) {
                  return year < currentYear || (year === currentYear && month < currentMonth);
                }
                return false;
              });`;

content = content.replace(fullTarget, fullReplace);

const targetOverdueGlobal = `          port.dissertationProgress.forEach(prog => {
            if (prog.progress === 'Completed') return;
            if (!prog.date) return;
            
            const [y, m] = prog.date.split('-');
            if (y && m) {
              const year = parseInt(y, 10);
              const month = parseInt(m, 10);
              if (year < currentYear || (year === currentYear && month < currentMonth)) {
                overdue.push({`;

const replaceOverdueGlobal = `          port.dissertationProgress.forEach(prog => {
            if (prog.progress === 'Completed') return;
            if (!prog.date) return;
            
            let year, month;
            if (prog.date.includes('-')) {
              const [y, m] = prog.date.split('-');
              year = parseInt(y, 10);
              month = parseInt(m, 10);
            } else {
              const d = new Date(prog.date);
              if (!isNaN(d.getTime())) {
                year = d.getFullYear();
                month = d.getMonth() + 1;
              }
            }
            if (year && month) {
              if (year < currentYear || (year === currentYear && month < currentMonth)) {
                overdue.push({`;

content = content.replace(targetOverdueGlobal, replaceOverdueGlobal);

fs.writeFileSync('src/components/StudentProgressDashboard.tsx', content);
