const { DateTime } = require("luxon");

module.exports = {
  formatDate: function (date) {
    date = DateTime.fromISO(date)
    return date.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
  }
}