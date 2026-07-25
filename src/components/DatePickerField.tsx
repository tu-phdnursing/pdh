/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

interface DatePickerFieldProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
}

// Map of Thai month abbreviations to English indices (0-11)
const THAI_MONTHS: Record<string, number> = {
  'ม.ค.': 0, 'มกราคม': 0,
  'ก.พ.': 1, 'กุมภาพันธ์': 1,
  'มี.ค.': 2, 'มีนาคม': 2,
  'เม.ย.': 3, 'เมษายน': 3,
  'พ.ค.': 4, 'พฤษภาคม': 4,
  'มิ.ย.': 5, 'มิถุนายน': 5,
  'ก.ค.': 6, 'กรกฎาคม': 6,
  'ส.ค.': 7, 'สิงหาคม': 7,
  'ก.ย.': 8, 'กันยายน': 8,
  'ต.ค.': 9, 'ตุลาคม': 9,
  'พ.ย.': 10, 'พฤศจิกายน': 10,
  'ธ.ค.': 11, 'ธันวาคม': 11
};

// Map of English month names to indices
const ENG_MONTHS: Record<string, number> = {
  'jan': 0, 'january': 0,
  'feb': 1, 'february': 1,
  'mar': 2, 'march': 2,
  'apr': 3, 'april': 3,
  'may': 4,
  'jun': 5, 'june': 5,
  'jul': 6, 'july': 6,
  'aug': 7, 'august': 7,
  'sep': 8, 'september': 8,
  'oct': 9, 'october': 9,
  'nov': 10, 'november': 10,
  'dec': 11, 'december': 11
};

export default function DatePickerField({
  value,
  onChange,
  disabled = false,
  placeholder = 'e.g., May 16, 2026',
  className = '',
  required = false,
  id
}: DatePickerFieldProps) {
  // Format display date
  const formatDisplay = (val: string) => {
    if (!val) return '';
    // If it's already in the target format (e.g. "15 May 2026"), just return it
    if (val.match(/^\d{1,2}\s[a-zA-Z]+\s\d{4}$/)) {
      return val;
    }
    
    let parsedString = val;
    if (val.includes('T')) {
      parsedString = val.split('T')[0];
    }
    const d = new Date(parsedString);
    if (!isNaN(d.getTime())) {
      // Use UTC if we parsed a strict YYYY-MM-DD string to avoid timezone shifts
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      if (parsedString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        options.timeZone = 'UTC';
      }
      return new Intl.DateTimeFormat('en-GB', options).format(d);
    }
    return val;
  };

  const [typedValue, setTypedValue] = useState(() => {
    if (value && (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}$/))) {
      return formatDisplay(value);
    }
    return value;
  });
  const [warning, setWarning] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Sync internal typed value with external state updates
  useEffect(() => {
    if (value) {
      if (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const formatted = formatDisplay(value);
        if (formatted !== typedValue) setTypedValue(formatted);
      } else if (value !== typedValue) {
        setTypedValue(value);
      }
    } else {
      setTypedValue('');
    }
  }, [value]);

  const parseAndNormalize = (input: string) => {
    if (!input.trim()) {
      setWarning(null);
      onChange('');
      return;
    }

    let parsedYear: number | null = null;
    let parsedMonth: number | null = null; // 0-indexed
    let parsedDay: number | null = null;
    let isThaiBuddhist = false;

    // 1. Check for 4-digit year in Buddhist Era range (2400 to 2700)
    const yearMatch = input.match(/\b(24\d{2}|25\d{2}|26\d{2})\b/);
    if (yearMatch) {
      parsedYear = parseInt(yearMatch[1], 10);
      isThaiBuddhist = true;
    } else {
      // Look for standard 4-digit Gregorian year (e.g., 2020 to 2040)
      const gregYearMatch = input.match(/\b(20\d{2})\b/);
      if (gregYearMatch) {
        parsedYear = parseInt(gregYearMatch[1], 10);
      }
    }

    // Try to parse day and month
    // Pattern: DD/MM/YYYY or D/M/YYYY
    const slashMatch = input.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/);
    if (slashMatch) {
      parsedDay = parseInt(slashMatch[1], 10);
      parsedMonth = parseInt(slashMatch[2], 10) - 1; // 0-indexed
      const yr = parseInt(slashMatch[3], 10);
      if (yr > 2400) {
        parsedYear = yr;
        isThaiBuddhist = true;
      } else if (yr < 100) {
        // 2-digit year guess
        parsedYear = yr + (yr > 50 ? 1900 : 2000);
      } else {
        parsedYear = yr;
      }
    }

    // Pattern: YYYY-MM-DD
    const isoMatch = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (isoMatch) {
      const yr = parseInt(isoMatch[1], 10);
      parsedMonth = parseInt(isoMatch[2], 10) - 1;
      parsedDay = parseInt(isoMatch[3], 10);
      if (yr > 2400) {
        parsedYear = yr;
        isThaiBuddhist = true;
      } else {
        parsedYear = yr;
      }
    }

    // Pattern: D Month YYYY or Month D, YYYY
    // Let's look for words
    const words = input.toLowerCase().split(/[\s,]+/);
    for (const word of words) {
      if (THAI_MONTHS[word] !== undefined) {
        parsedMonth = THAI_MONTHS[word];
      } else if (ENG_MONTHS[word] !== undefined) {
        parsedMonth = ENG_MONTHS[word];
      }
      
      const num = parseInt(word, 10);
      if (!isNaN(num)) {
        if (num > 0 && num <= 31 && parsedDay === null) {
          parsedDay = num;
        }
      }
    }

    if (isThaiBuddhist && parsedYear) {
      const convertedYear = parsedYear - 543;
      let finalDateStr = '';

      if (parsedMonth !== null && parsedDay !== null) {
        // Construct standard ISO string for cleaner storage
        const mm = String(parsedMonth + 1).padStart(2, '0');
        const dd = String(parsedDay).padStart(2, '0');
        finalDateStr = `${convertedYear}-${mm}-${dd}`;
      } else {
        // Just substitute the year in the original typed string
        finalDateStr = input.replace(String(parsedYear), String(convertedYear));
      }

      setWarning(`⚠️ ตรวจพบปี พ.ศ. ${parsedYear} ระบบได้แปลงเป็นปี ค.ศ. ${convertedYear} ให้โดยอัตโนมัติ (${finalDateStr})`);
      setTypedValue(finalDateStr);
      onChange(finalDateStr);
    } else {
      // Validate correct format (should contain a valid year)
      if (!parsedYear) {
        setWarning('⚠️ รูปแบบวันที่ไม่ถูกต้อง กรุณาระบุปี ค.ศ. (เช่น 2026) หรือป้อนให้ถูกต้อง');
      } else {
        setWarning(null);
      }
      if (parsedYear && parsedMonth !== null && parsedDay !== null) {
        const mm = String(parsedMonth + 1).padStart(2, '0');
        const dd = String(parsedDay).padStart(2, '0');
        const isoStr = `${parsedYear}-${mm}-${dd}`;
        const formatted = formatDisplay(isoStr);
        setTypedValue(formatted);
        onChange(formatted);
        return;
      }
      onChange(input);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypedValue(val);
    // Don't validate instantly as they type to avoid annoying alerts, but do a basic pass
    if (val.match(/\b(24\d{2}|25\d{2}|26\d{2})\b/)) {
      // Let them know as they type that พ.ศ. is being monitored
      setWarning('✍️ กำลังพิมพ์ปี พ.ศ. ระบบจะแปลงเป็น ค.ศ. ให้เมื่อพิมพ์เสร็จ');
    } else {
      setWarning(null);
    }
  };

  const handleBlur = () => {
    parseAndNormalize(typedValue);
  };

  const handleCalendarClick = () => {
    if (disabled) return;
    try {
      if (dateInputRef.current) {
        // Try calling showPicker (standard modern browser method)
        if (typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.click();
        }
      }
    } catch (e) {
      // Fallback
      dateInputRef.current?.click();
    }
  };

  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value; // Guaranteed to be in YYYY-MM-DD
    if (selectedDate) {
      const formatted = formatDisplay(selectedDate);
      setTypedValue(formatted);
      setWarning(null);
      onChange(formatted); // or onChange(selectedDate) depending on storage preference
    }
  };

  return (
    <div className="relative w-full text-left">
      <div className="relative flex items-center">
        <input
          type="text"
          id={id}
          disabled={disabled}
          placeholder={placeholder}
          value={typedValue}
          onChange={handleTextChange}
          onBlur={handleBlur}
          required={required}
          className={`w-full pr-10 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-75 focus:outline-tu-red transition-all duration-200 ${className}`}
        />
        
        {/* Hidden HTML Date Picker triggerable by the calendar button */}
        <input
          type="date"
          ref={dateInputRef}
          onChange={handleCalendarChange}
          disabled={disabled}
          className="absolute inset-y-0 right-0 w-0 h-0 opacity-0 pointer-events-none"
        />

        <button
          type="button"
          onClick={handleCalendarClick}
          disabled={disabled}
          className="absolute right-2 p-1.5 text-gray-400 hover:text-tu-red disabled:opacity-50 transition cursor-pointer"
          title="เลือกวันที่จากปฏิทิน (Select Date from Calendar)"
        >
          <Calendar size={16} />
        </button>
      </div>

      {warning && (
        <span className="text-[10px] font-semibold text-amber-600 block mt-1 animate-pulse flex items-center gap-1">
          <AlertCircle size={12} className="shrink-0" />
          {warning}
        </span>
      )}
    </div>
  );
}
