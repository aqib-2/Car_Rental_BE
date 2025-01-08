const adjustDates = (from,to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  toDate.setHours(23, 59, 59, 999);
  return { from: fromDate, to: toDate };
}

module.exports = {adjustDates};