const { DateTime } = require("luxon");

module.exports = {
  // Check if the string is a mention string
  isMentionId(str) {
    return /<@U[\d\w]+>/i.test(str)
  },

  // Gets the user Id from mention string
  // As viewed in slack @Name
  // As viewed in raw message <@U127391827> -> U127391827
  getMentionId(str) {
    return /<@(U[\d\w]+)>/i.exec(str)[1];
  },

  allTrue(array) {
    return array.filter(e => !e).length == 0
  },

  random(val) {
    return Math.floor(Math.random() * val);
  },

  formatDate(date) {
    date = DateTime.fromISO(date)
    return date.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
  },

  parseDate(date, month, time, ampm) {
    let timeSplit = time.split(":").map(x => parseInt(x));
    if (ampm.toLowerCase() == "pm") timeSplit[0] += 12;
    let d = new Date(`${date} ${month} ${new Date().getFullYear()} ${timeSplit[0]}:${timeSplit[1]}:00 GMT`);
    return d == "Invalid Date" ? null : d.toISOString();
  }
}