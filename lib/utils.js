const { DateTime } = require("luxon");

const CONSTS = {
  messages: {
    responses: [
      "Sure thing!",
      "No problem!",
      "Of course!",
      "Done!",
      "Certainly!",
      "No problem!",
    ],
    warns: [
      `Uh oh it looks like there’s no time slot available within your working hour constraints`,
      `Sorry, it doesn't look like there's any free time slot that matches your working hour constraints`,
    ],
  },
  emojis: {
    reactions: [
      ":blush:",
      ":thumbsup::skin-tone-4:",
      ":white_check_mark:",
      ":grin:",
      ":innocent:",
      ":smile:",
      ":sunglasses:",
      ":relieved:",
      ":nerd_face:",
    ],
    calendar: ":spiral_calendar_pad:",
  },
};

/**
 * Generates a random number up to a given value.
 *
 * @param {Array} array - Maximum value.
 * @return {object} - Returns a random element in the array
 */
const random = function (array) {
  return array[Math.floor(Math.random() * array.length)];
};

const context = {
  slack: {
    /**
     * Gets the user Id from mention string
     * As viewed in slack @Name
     * As viewed in raw message <@U127391827> -> U127391827
     *
     * @param {string} id - Slack ID without the identifying features.
     * @return {string} - Returns an ID which is recognizable by other services.
     */
    getId: function (id) {
      return /<@([uU][\d\w]+)>/i.exec(id)[1];
    },
  },
  date: {
    /**
     * Formats a date using Luxon's DATETIME_MED_WITH_WEEKDAY.
     *
     * @param {*} date - Date as an ISO string
     * @return {string} - Formatted date
     */
    format: function (date) {
      date = DateTime.fromISO(date);
      return date.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
    },
  },
  message: {
    /**
     * Posts an warn to the user regarding scheduling.
     *
     * @return {string} - Understandable warn message given to user.
     */
    warn: function () {
      return random(warns);
    },
    generate: {
      /**
       * Returns a schedule message upon successful schedule.
       *
       * @param {string} start - Chosen start date and time of the event.
       * @param {string} end - Chosen end date and time of the event.
       * @param {string} title - Given title of event (optional).
       * @return {string} - Returns nicely formatted message.
       */
      schedule: function (start, end, title) {
        start = DateTime.fromISO(start).toLocaleString(
          DateTime.DATETIME_MED_WITH_WEEKDAY
        );
        end = DateTime.fromISO(end).toLocaleString(
          DateTime.DATETIME_MED_WITH_WEEKDAY
        );

        return `${random(CONSTS.messages.responses)} ${random(
          CONSTS.emojis.reactions
        )} I've booked ${
          title && title.length ? title : "an event"
        } from \*${start}\* to \*${end}\* ${
          CONSTS.emojis.calendar
        }.\n To reschedule, just let me know.`;
      },
      /**
       * Returns a reschedule message upon successful reschedule.
       *
       * @param {string} oldDate - Previous date of the event.
       * @param {string} newDate - New date of the event.
       * @param {string} title - Event title, if given.
       * @return {string} - Returns a nicely formatted message.
       */
      reschedule: function (oldDate, newDate, title) {
        newDate = DateTime.fromISO(newDate).toLocaleString(
          DateTime.DATETIME_MED_WITH_WEEKDAY
        );
        oldDate = oldDate
          ? DateTime.fromISO(oldDate).toLocaleString(
              DateTime.DATETIME_MED_WITH_WEEKDAY
            )
          : null;
        return `${random(CONSTS.messages.responses)} ${random(
          CONSTS.emojis.reactions
        )} I've moved ${
          oldDate
            ? `\*${oldDate}\*`
            : `${title && title.length ? title : "your event"}`
        } to \*${newDate}\*. ${CONSTS.emojis.calendar}`;
      },
      /**
       * Posts a message to the user upon successful cancellation.
       *
       * @param {string} title - Title of the event which has been cancelled.
       * @param {string} dateTimeISO - Date and time of event cancelled.
       * @return {string} - Understandable message posted to user.
       */
      cancel: function (title, dateTimeISO) {
        return `${random(CONSTS.messages.responses)} ${random(
          CONSTS.emojis.reactions
        )} I've cancelled \"${title}\", which was booked for \*${DateTime.fromISO(
          dateTimeISO
        ).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}\*. ${
          CONSTS.emojis.calendar
        }`;
      },
    },
  },
};

module.exports = context;
