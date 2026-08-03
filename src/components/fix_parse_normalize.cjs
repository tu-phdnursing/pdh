const fs = require('fs');

let content = fs.readFileSync('src/components/DatePickerField.tsx', 'utf8');

const targetParse = `      onChange(input);
    }
  };`;

const replaceParse = `      if (parsedYear && parsedMonth !== null && parsedDay !== null) {
        const d = new Date(parsedYear, parsedMonth, parsedDay);
        if (!isNaN(d.getTime())) {
          const formatted = new Intl.DateTimeFormat('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
          }).format(d);
          setTypedValue(formatted);
          onChange(formatted);
          return;
        }
      }
      onChange(input);
    }
  };`;

content = content.replace(targetParse, replaceParse);
fs.writeFileSync('src/components/DatePickerField.tsx', content);
