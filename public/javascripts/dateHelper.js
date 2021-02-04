/*
 *
 * DATE UTILITY FUNCTIONS
 *
 */
function formatDisplayedDate(viewOption, date) {
  const copy = new Date(date.getTime());
  switch (viewOption) {
    case "Day":
      return new Intl.DateTimeFormat("en-UK", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(copy);
    case "Week":
      dateFormat = new Intl.DateTimeFormat("en-UK", {
        // year: "numeric",
        month: "short",
        day: "numeric",
      });
      if (copy.getMonth() === addDays(new Date(copy.getTime()), 6).getMonth()) {
        return (
          copy.getDate() +
          " - " +
          dateFormat.format(copy.setDate(copy.getDate() + 6))
        );
      } else if (
        copy.getFullYear() ===
        addDays(new Date(copy.getTime()), 6).getFullYear()
      ) {
        return (
          dateFormat.format(copy) +
          " - " +
          dateFormat.format(copy.setDate(copy.getDate() + 6))
        );
      } else {
        return (
          dateFormat.format(copy) +
          " " +
          copy.getFullYear() +
          " - " +
          dateFormat.format(copy.setDate(copy.getDate() + 6)) +
          " " +
          copy.getFullYear()
        );
      }
    case "Month":
      return new Intl.DateTimeFormat("en-UK", {
        year: "numeric",
        month: "long",
      }).format(copy);
    case "Year":
      return (
        new Intl.DateTimeFormat("en-UK", {
          month: "long",
        }).format(copy) +
        " - " +
        new Intl.DateTimeFormat("en-UK", {
          month: "long",
          year: "numeric",
        }).format(copy.setMonth(copy.getMonth() + 3))
      );
  }
}

function addDays(date, daysNumber) {
  date.setDate(date.getDate() + daysNumber);
  return date;
}

function getFirstDayOfMonth(date) {
  date.setDate(1);
  return date;
}
function getFirstDayOfWeek(date) {
  let copy = new Date(date.getTime());
  copy.setDate(copy.getDate() - 1); //this way copy.getDay() will return 0 for Mon, 1 for Tue, 3 for Wed etc...
  const dayOfMonthFirstWeekDay = date.getDate() - copy.getDay();
  date.setDate(dayOfMonthFirstWeekDay);
  return date;
}
function daysInMonth(date) {
  const month = date.getMonth();
  const year = date.getFullYear();
  return new Date(year, month + 1, 0).getDate();
}

function waitFunction(ms) {
  return new Promise((promise) => setTimeout(promise, ms));
}
