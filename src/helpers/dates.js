import { DateTime } from "luxon";

// Convert to medium size date
export const convertToDateTimeMed = (date) => {
  date = new Date(date);
  return DateTime.fromJSDate(date).toLocaleString(DateTime.DATETIME_MED) || "";
};

// Check if dates are equal
export const checkIfDatesEqual = (date1, date2) => {
  const time1 = new Date(date1).getMinutes();
  const time2 = new Date(date2).getMinutes();
  date1 = new Date(time1);
  date2 = new Date(time2);
  if (date1.getTime() === date2.getTime()) return true;
  return false;
};
