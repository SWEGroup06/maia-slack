const { DateTime } = require("luxon");

const messages = [
  "Sure thing!",
  "No problem!",
  "Of course!",
  "Done!",
  "Certainly!",
  "No problem!",
];

const emojis = [
  ":blush:",
  ":thumbsup::skin-tone-4:",
  ":white_check_mark:",
  ":grin:",
  ":innocent:",
  ":smile:",
  ":sunglasses:",
  ":relieved:",
  ":nerd_face:",
];

// TODO: JSDoc

const context = {
  /**
   * Gets the user Id from mention string
   * As viewed in slack @Name
   * As viewed in raw message <@U127391827> -> U127391827
   *
   * @param {string} str
   * @return {string}
   */
  getMentionId(str) {
    return /<@(U[\d\w]+)>/i.exec(str)[1];
  },

  /**
   *
   * @param {Integer} val
   * @return {Integer}
   */
  random(val) {
    return Math.floor(Math.random() * val);
  },

  /**
   *
   * @param {*} date
   * @return {string}
   */
  formatDate(date) {
    date = DateTime.fromISO(date);
    return date.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
  },

  /**
   *
   * @param {*} date
   * @param {*} month
   * @param {*} time
   * @param {*} ampm
   * @return {string}
   */
  parseDate(date, month, time, ampm) {
    const timeSplit = time.split(":").map((x) => parseInt(x));
    if (ampm.toLowerCase() === "pm") timeSplit[0] += 12;
    const d = new Date(
      `${date} ${month} ${new Date().getFullYear()} ${timeSplit[0]}:${
        timeSplit[1]
      }:00 GMT`
    );
    return d === "Invalid Date" ? null : d.toISOString();
  },

  /**
   *
   * @param {*} oldDate
   * @param {*} newDate
   * @param {*} meetingTitle
   * @return {string}
   */
  rescheduleMessage(oldDate, newDate, meetingTitle) {
    newDate = DateTime.fromISO(newDate).toLocaleString(
      DateTime.DATETIME_MED_WITH_WEEKDAY
    );

    return (
      messages[context.random(messages.length)] +
      " " +
      emojis[context.random(emojis.length)] +
      " " +
      "I've moved " +
      (!oldDate
        ? meetingTitle.length === 0
          ? "your event"
          : meetingTitle
        : "your meeting from `" +
          DateTime.fromISO(oldDate)
            .plus({ hours: 1 })
            .toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) +
          "`") +
      " to `" +
      newDate +
      "`. :spiral_calendar_pad:"
    );
  },

  /**
   *
   * @param {*} start
   * @param {*} end
   * @param {*} title
   * @return {string}
   */
  postScheduleMessage(start, end, title) {
    start = DateTime.fromISO(start).toLocaleString(
      DateTime.DATETIME_MED_WITH_WEEKDAY
    );
    end = DateTime.fromISO(end).toLocaleString(
      DateTime.DATETIME_MED_WITH_WEEKDAY
    );
    return (
      messages[Math.floor(Math.random() * messages.length)] +
      " " +
      emojis[Math.floor(Math.random() * emojis.length)] +
      " " +
      `I've booked ${
        title.length === 0 ? "an event" : title
      } from \*${start}\* to \*${end}\* :spiral_calendar_pad:. ` +
      `\n To reschedule, just let me know.`
    );
  },

  /**
   *
   * @param {*} msg
   * @return {string}
   */
  postScheduleErrorMessage(msg) {
    if (msg === 2) {
      const options = [
        `Uh oh it looks like there’s no time slot available within your constraints, please try another day`,
        `Sorry, it doesn't look like there's any free time slot that matches your constraints. Please try another day`,
      ];
      const x = Math.floor(Math.random() * options.length);
      return options[x];
    } else if (msg === 1) {
      const options = [
        `Your history is still being processed, please try again in a couple minutes!`,
        "I am still calculating your preferences, please try again in a couple minutes!",
      ];
      const x = Math.floor(Math.random() * options.length);
      return options[x];
    }
  },

  /**
   *
   * @param {*} msg
   * @param {*} title
   * @return {string}
   */
  rescheduleErrorMessage(msg, title) {
    if (msg === 2) {
      const options = [
        `Uh oh it looks like there’s no time slot available to reschedule ${
          title.length === 0 ? "that event" : title
        } to within your constraints`,
      ];
      const x = Math.floor(Math.random() * options.length);
      return options[x];
    } else if (msg === 1) {
      const options = [
        `Your history is still being processed, please try again in a couple minutes!`,
        "I am still calculating your preferences, please try again in a couple minutes!",
      ];
      const x = Math.floor(Math.random() * options.length);
      return options[x];
    }
  },

  /**
   *
   * @param {*} title
   * @param {*} dateTimeISO
   * @return {string}
   */
  postCancelMessage(title, dateTimeISO) {
    const dateTime = DateTime.fromISO(dateTimeISO);

    return (
      `${messages[Math.floor(Math.random() * messages.length)]} ` +
      `${emojis[Math.floor(Math.random() * emojis.length)]} ` +
      `I've cancelled \"${title}\", which was booked for ` +
      `${dateTime.toLocaleString(
        DateTime.DATETIME_MED_WITH_WEEKDAY
      )}. :spiral_calendar_pad:`
    );
  },

  /**
   *
   * @param {string} msg
   * @return {string}
   */
  postCancelErrorMessage(msg) {
    return msg;
  },
};

module.exports = context;
