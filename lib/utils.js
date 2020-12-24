const { DateTime } = require("luxon");

let messages = ["Sure thing!", "No problem!", "Of course!", "Done!", "Certainly!", "No problem!"]

let emojis = [":blush:", ":thumbsup::skin-tone-4:", ":white_check_mark:", ":grin:", ":innocent:", ":smile:",
  ":sunglasses:", ":relieved:", ":nerd_face:"]

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
    return array.filter(e => !e).length === 0
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
    if (ampm.toLowerCase() === "pm") timeSplit[0] += 12;
    let d = new Date(`${date} ${month} ${new Date().getFullYear()} ${timeSplit[0]}:${timeSplit[1]}:00 GMT`);
    return d === "Invalid Date" ? null : d.toISOString();
  },

  rescheduleMessage(oldDate, newDate, meetingTitle) {
    newDate = DateTime.fromISO(newDate).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)

    return messages[Math.floor(Math.random() * messages.length)] + " "
     + emojis[Math.floor(Math.random() * emojis.length)] + " "
     + "I've moved " + ((!oldDate)
      ? (meetingTitle.length === 0 ? "your event" : meetingTitle)
      : "your meeting from `"
      + DateTime.fromISO(oldDate).plus({hours: 1}).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) + "`")
     + " to `" + newDate + "`. :spiral_calendar_pad:"
  },

  scheduleMessage(start, end, title) {
    start = DateTime.fromISO(start).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
    end = DateTime.fromISO(end).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
    return messages[Math.floor(Math.random() * messages.length)] + " "
     + emojis[Math.floor(Math.random() * emojis.length)] + " "
     + `I've booked ${title.length === 0 ? 'an event' : title} from \*${start}\* to \*${end}\* :spiral_calendar_pad:. `
     + `\n To reschedule, just let me know.`
  },

  scheduleErrorMessage(msg) {
    console.log('----scheduleErrorMessage----', msg)
    if (msg === 2) {
      console.log('----2----')
      const options = [`Uh oh it looks like there’s no time slot available, please try another day`,
        `Sorry, it doesn't look like there's any free time slot. Please try another day`]
      const x = Math.floor(Math.random() * options.length);
      return options[x];
    }
    else if (msg === 1) {
      console.log('----1----')
      const options = [`Your history is still being processed, please try again in a couple minutes!`,
        "I am still calculating your preferences, please try again in a couple minutes!"
      ]
      const x = Math.floor(Math.random() * options.length);
      return options[x];
    }
  },

  rescheduleErrorMessage(msg, title) {
    if (msg === 2) {
      const options = [`Uh oh it looks like there’s no time slot available to reschedule ${title.length === 0 ? 'that event' : title} to`,
      ]
      const x = Math.floor(Math.random() * options.length);
      return options[x];
    }
    else if (msg === 1) {
      const options = [`Your history is still being processed, please try again in a couple minutes!`,
          "I am still calculating your preferences, please try again in a couple minutes!"
      ]
      const x = Math.floor(Math.random() * options.length);
      return options[x];
    }
  }
}