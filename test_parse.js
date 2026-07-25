const parseDate = (dateStr) => {
  const d = new Date(dateStr);
  console.log(d.getFullYear(), d.getMonth() + 1);
};
parseDate("June 2026");
parseDate("2026-06");
