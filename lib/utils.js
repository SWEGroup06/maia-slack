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
  },

  rescheduleMessage(oldDate, newDate) {
    newDate = DateTime.fromISO(newDate).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)

    if (!oldDate) {
      return "Sure thing! :blush: I've moved your meeting to `" + newDate + "`. :spiral_calendar_pad:"
    } else {
      oldDate = DateTime.fromISO(oldDate).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
      return "Sure thing! :blush: I've moved your meeting from `"
       + oldDate + "` to `" + newDate + "`. :spiral_calendar_pad:"
    }
  },

  scheduleMessage(start, end) {
    start = DateTime.fromISO(start).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
    end = DateTime.fromISO(end).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
    return `I've booked a meeting from \*${start}\* to \*${end}\* :spiral_calendar_pad:. To reschedule, use \`maia reschedule\``
  },

  scheduleSlotNotFoundMessage() {
    const options = [`Uh oh it looks like there’s no time slot available, please try another day`,
    `Sorry, it doesn't look like there's any free time slot. Please try another day`]
    const x = Math.floor(Math.random()*options.length);
    return options[x];
  }
}