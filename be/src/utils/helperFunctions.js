const adjustDates = (from,to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  return { from: fromDate, to: toDate };
}

module.exports = {adjustDates};