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
   * @param {string} id - Slack ID without the identifying features.
   * @return {string} - Returns an ID which is recognizable by other services.
   */
  getMentionId(id) {
    return /<@(U[\d\w]+)>/i.exec(id)[1];
  },

  /**
   * Generates a random number up to a given value.
   *
   * @param {number} val - Maximum value.
   * @return {number} - Returns a random number between 0 and the given number.
   */
  random(val) {
    return Math.floor(Math.random() * val);
  },

  /**
   * Formats a date using Luxon's DATETIME_MED_WITH_WEEKDAY.
   * 
   * @param {*} date - Date as an ISO string
   * @return {string} - Formatted date
   */
  formatDate(date) {
    date = DateTime.fromISO(date);
    return date.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
  },

  /**
   * Checks whether a date is valid, if so returns it as an ISO, otherwise
   * returns null.
   * 
   * @param {string} date - Date to format.
   * @param {string} month - Month to format.
   * @param {string} time - Time to format.
   * @param {string} ampm - 
   * @return {string} - Returns formatted date
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
   * Returns a reschedule message upon successful reschedule.
   *
   * @param {string} oldDate - Previous date of the event.
   * @param {string} newDate - New date of the event.
   * @param {string} meetingTitle - Event title, if given.
   * @return {string} - Returns a nicely formatted message.
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
   * Returns a schedule message upon successful schedule.
   *
   * @param {string} start - Chosen start date and time of the event.
   * @param {string} end - Chosen end date and time of the event.
   * @param {string} title - Given title of event (optional).
   * @return {string} - Returns nicely formatted message.
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
   * Posts an error to the user regarding scheduling.
   *
   * @param {number} msg - Number relating to some error message.
   * @return {string} - Understandable error message given to user.
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
   * Posts an error to the user regarding rescheduling.
   *
   * @param {number} msg - Number relating to some error message.
   * @param {string} title - Title of the event cancelled.
   * @return {string} - Understandable error message given to user.
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
   * Posts a message to the user upon successful cancellation.
   *
   * @param {string} title - Title of the event which has been cancelled.
   * @param {string} dateTimeISO - Date and time of event cancelled.
   * @return {string} - Understandable message posted to user.
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
   * TODO: Fix this.
   * Posts an understandable error message to the user regarding cancellation.
   *
   * @param {number} msg - Number relating to some error message.
   * @return {string} -
   */
  postCancelErrorMessage(msg) {
    return msg;
  },
};

module.exports = context;
