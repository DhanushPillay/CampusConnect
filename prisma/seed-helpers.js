function getWeekdays(endDate, count) {
  const days = [];
  const cursor = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

  while (days.length < count) {
    const weekday = cursor.getUTCDay();
    if (weekday > 0 && weekday < 6) days.unshift(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return days;
}

function attendanceStatus(studentIndex, subjectIndex, dayIndex) {
  const value = (studentIndex * 17 + subjectIndex * 11 + dayIndex * 7) % 100;
  if (value < 8) return "ABSENT";
  if (value < 15) return "LATE";
  return "PRESENT";
}

function gradeLetter(percent) {
  if (percent >= 90) return "A";
  if (percent >= 75) return "B";
  if (percent >= 60) return "C";
  if (percent >= 40) return "D";
  return "F";
}

module.exports = { attendanceStatus, gradeLetter, getWeekdays };