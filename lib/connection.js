const CONFIG = require('../config.js');

const axios = require('axios');

const context = {
  _request: async function(path, params) {
    // Encode each parameter for each request
    Object.keys(params).forEach((p) => params[p] =
     encodeURIComponent(JSON.stringify(params[p])));

    // Make GET request
    const res = await axios.get(CONFIG.serverURL + path, {params});
    return res.data;
  },

  /**
   * TODO:
   * @param {String} slackId
   * @param {String} slackEmail
   * @return {Promise<any>}
   */
  login: function(slackId, slackEmail) {
    return context._request('/auth/login', {slackEmail, slackId});
  },

  /**
   * TODO:
   * @param {String} title
   * @param {Array} slackEmails
   * @param {String} startDateTimeOfRange
   * @param {String} endDateTimeOfRange
   * @param {Boolean} flexible
   * @param {Number} duration
   * @param {String} beforeAfterKey
   * @return {Promise<any>}
   */
  schedule: function(title, slackEmails, startDateTimeOfRange,
      endDateTimeOfRange, flexible, duration, beforeAfterKey) {
    return context._request('/api/schedule', {
      title,
      slackEmails,
      startDateTimeOfRange,
      endDateTimeOfRange,
      flexible,
      duration,
      beforeAfterKey,
    });
  },

  /**
   * TODO:
   * @param {String} slackEmail
   * @param {String} startDateTime
   * @param {String} endDateTime
   * @param {String} newStartDateTime
   * @param {String} newEndDateTime
   * @param {String} meetingTitle
   * @param {String} beforeAfterKey
   * @return {Promise<any>}
   */
  reschedule: function(slackEmail, startDateTime, endDateTime, newStartDateTime,
      newEndDateTime, meetingTitle, beforeAfterKey) {
    return context._request('/api/reschedule', {
      slackEmail,
      startDateTime,
      endDateTime,
      newStartDateTime,
      newEndDateTime,
      meetingTitle,
      beforeAfterKey,
    });
  },

  /**
   *
   * @param {String} slackEmail
   * @param {Array} busyDays
   * @param {Array} busyTimes
   * @return {Promise<any>}
   */
  constraints: function(slackEmail, busyDays, busyTimes) {
    return context._request('/api/constraints', {
      slackEmail,
      busyDays,
      busyTimes,
    });
  },

  /**
   *
   * @param {String} slackEmail
   * @param {String} meetingTitle
   * @param {String} meetingDateTime
   * @return {Promise<any>}
   */
  cancel: function(slackEmail, meetingTitle, meetingDateTime) {
    return context._request('/api/cancel', {
      slackEmail,
      meetingTitle,
      meetingDateTime,
    });
  },

  /**
   *
   * @param {String} text
   * @return {Promise<any>}
   */
  nlp: function(text) {
    return context._request('/nlp', {text});
  },

  /**
   * TODO:
   * @param {String} slackEmail
   * @return {Promise<any>}
   */
  preferences: function(slackEmail) {
    return context._request('/api/preferences', {slackEmail});
  },

  /**
   * TODO:
   * @param {String} slackEmail
   * @param {String} oldTitle
   * @param {String} oldDateTime
   * @param {String} newStartDateRange
   * @param {String} newEndDateRange
   * @param {String} newStartTimeRange
   * @param {String} newEndTimeRange
   * @param {String} newDayOfWeek
   * @return {Promise<any>}
   */
  tp: function(slackEmail, oldTitle, oldDateTime, newStartDateRange,
      newEndDateRange, newStartTimeRange, newEndTimeRange, newDayOfWeek) {
    return context._request('/api/tp', {
      slackEmail,
      oldTitle,
      oldDateTime,
      newStartDateRange,
      newEndDateRange,
      newStartTimeRange,
      newEndTimeRange,
      newDayOfWeek,
    });
  },
};

module.exports = context;
