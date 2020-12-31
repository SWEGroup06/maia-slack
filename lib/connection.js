const CONFIG = require("../config.js");

const axios = require("axios");

// TODO: JSDoc

const context = {
  /**
   * 
   * @param {string} path 
   * @param {object} params 
   * @return {object}
   */
  _request: async function (path, params) {
    // Encode each parameter for each request
    Object.keys(params).forEach(
      (p) => (params[p] = encodeURIComponent(JSON.stringify(params[p])))
    );

    // Make GET request
    const res = await axios.get(CONFIG.serverURL + path, { params });
    return res.data;
  },

  /**
   * TODO:
   *
   * @param {string} slackId
   * @param {string} slackEmail
   * @return {Promise<any>}
   */
  login: function (slackId, slackEmail) {
    return context._request("/auth/login", { slackEmail, slackId });
  },

  /**
   * TODO:
   *
   * @param {string} title
   * @param {Array} slackEmails
   * @param {string} startDateTimeOfRange
   * @param {string} endDateTimeOfRange
   * @param {boolean} flexible
   * @param {number} duration
   * @param {string} beforeAfterKey
   * @return {Promise<any>}
   */
  schedule: function (
    title,
    slackEmails,
    startDateTimeOfRange,
    endDateTimeOfRange,
    flexible,
    duration,
    beforeAfterKey
  ) {
    return context._request("/api/schedule", {
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
   *
   * @param {string} slackEmail
   * @param {string} startDateTime
   * @param {string} endDateTime
   * @param {string} newStartDateTime
   * @param {string} newEndDateTime
   * @param {string} meetingTitle
   * @param {string} beforeAfterKey
   * @return {Promise<any>}
   */
  reschedule: function (
    slackEmail,
    startDateTime,
    endDateTime,
    newStartDateTime,
    newEndDateTime,
    meetingTitle,
    beforeAfterKey
  ) {
    return context._request("/api/reschedule", {
      slackEmail,
      startDateTime,
      endDateTime,
      newStartDateTime,
      newEndDateTime,
      meetingTitle,
      beforeAfterKey,
    });

  sp: function(slackEmails, title, duration, startDateRange, endDateRange, startTimeRange, endTimeRange, flexible, dayOfWeek) {
    return context._request('/api/sp', {slackEmails, title, duration, startDateRange, endDateRange, startTimeRange, endTimeRange, flexible, dayOfWeek});
  },

  reschedule: function(slackEmail, startDateTime, endDateTime, newStartDateTime, newEndDateTime, meetingTitle, beforeAfterKey) {
    return context._request('/api/reschedule', {slackEmail, startDateTime, endDateTime, newStartDateTime, newEndDateTime, meetingTitle, beforeAfterKey});
  },

  /**
   *
   * @param {string} slackEmail
   * @param {Array} busyDays
   * @param {Array} busyTimes
   * @return {Promise<any>}
   */
  constraints: function (slackEmail, busyDays, busyTimes) {
    return context._request("/api/constraints", {
      slackEmail,
      busyDays,
      busyTimes,
    });
  },

  /**
   *
   * @param {string} slackEmail
   * @param {string} meetingTitle
   * @param {string} meetingDateTime
   * @return {Promise<any>}
   */
  cancel: function (slackEmail, meetingTitle, meetingDateTime) {
    return context._request("/api/cancel", {
      slackEmail,
      meetingTitle,
      meetingDateTime,
    });
  },

  /**
   *
   * @param {string} text
   * @return {Promise<any>}
   */
  nlp: function (text) {
    return context._request("/nlp", { text });
  },

  /**
   * TODO:
   *
   * @param {string} slackEmail
   * @return {Promise<any>}
   */
  preferences: function (slackEmail) {
    return context._request("/api/preferences", { slackEmail });
  },

  /**
   * TODO:
   *
   * @param {string} slackEmail
   * @param {string} oldTitle
   * @param {string} oldDateTime
   * @param {string} newStartDateRange
   * @param {string} newEndDateRange
   * @param {string} newStartTimeRange
   * @param {string} newEndTimeRange
   * @param {string} newDayOfWeek
   * @return {Promise<any>}
   */
  tp: function (
    slackEmail,
    oldTitle,
    oldDateTime,
    newStartDateRange,
    newEndDateRange,
    newStartTimeRange,
    newEndTimeRange,
    newDayOfWeek
  ) {
    return context._request("/api/tp", {
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
