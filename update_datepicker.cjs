const fs = require('fs');

let content = fs.readFileSync('src/components/DatePickerField.tsx', 'utf8');

const targetEffect = `  // Sync internal typed value with external state updates
  useEffect(() => {
    setTypedValue(value);
  }, [value]);`;

const replaceEffect = `  // Format display date
  const formatDisplay = (val: string) => {
    if (!val) return '';
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d);
    }
    return val;
  };

  // Sync internal typed value with external state updates
  useEffect(() => {
    if (value && value !== typedValue) {
      // Check if it's an ISO or YYYY-MM-DD
      if (value.includes('T') || value.match(/^\\d{4}-\\d{2}-\\d{2}$/)) {
        setTypedValue(formatDisplay(value));
      } else {
        setTypedValue(value);
      }
    }
  }, [value]);`;

content = content.replace(targetEffect, replaceEffect);

const targetHandleCalendarChange = `  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value; // Guaranteed to be in YYYY-MM-DD
    if (selectedDate) {
      setTypedValue(selectedDate);
      setWarning(null);
      onChange(selectedDate);
    }
  };`;

const replaceHandleCalendarChange = `  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value; // Guaranteed to be in YYYY-MM-DD
    if (selectedDate) {
      const formatted = formatDisplay(selectedDate);
      setTypedValue(formatted);
      setWarning(null);
      onChange(formatted); // or onChange(selectedDate) depending on storage preference
    }
  };`;

content = content.replace(targetHandleCalendarChange, replaceHandleCalendarChange);

fs.writeFileSync('src/components/DatePickerField.tsx', content);
