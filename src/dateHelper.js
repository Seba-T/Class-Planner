/*
 *
 * DATE UTILITY FUNCTIONS
 *
 */
exports.addDays = (date, daysNumber) => {
  date.setDate(date.getDate() + daysNumber);
  return date;
}

exports.getFirstDayOfMonth = (date) => {
  date.setDate(1);
  return date;
}
exports.getFirstDayOfWeek = (date) => {
  let copy = new Date(date.getTime());
  copy.setDate(copy.getDate() - 1); //this way copy.getDay() will return 0 for Mon, 1 for Tue, 3 for Wed etc...
  const dayOfMonthFirstWeekDay = date.getDate() - copy.getDay();
  date.setDate(dayOfMonthFirstWeekDay);
  return date;
}
exports.daysInMonth = (date) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  return new Date(year, month + 1, 0).getDate();
}

exports.waitFunction = (ms) => {
  return new Promise((promise) => setTimeout(promise, ms));
}
