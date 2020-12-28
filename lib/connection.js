const CONFIG = require('../config.js');

const axios = require('axios');

const context = {
  _request: async function(path, params) {
    // Encode each parameter
    Object.keys(params).forEach(p => params[p] = encodeURIComponent(JSON.parse(params[p])));

    // Make request
    return await axios.get(CONFIG.serverURL + path, {params});
  },
  login: function(slackEmail, slackId) {
    return context._request('/auth/login', {slackEmail, slackId});
  },
  schedule: function(title, slackEmails, startDateTimeOfRange, endDateTimeOfRange, flexible, duration, beforeAfterKey) {
    return context._request('/auth/logout', {title, slackEmails, startDateTimeOfRange, endDateTimeOfRange, flexible, duration, beforeAfterKey});
  },
  reschedule: function(slackEmail, startDateTime, endDateTime, newStartDateTime, newEndDateTime, meetingTitle, beforeAfterKey) {
    return context._request('/api/reschedule', {slackEmail, startDateTime, endDateTime, newStartDateTime, newEndDateTime, meetingTitle, beforeAfterKey});
  },
  constraints: function(slackEmail, busyDays, busyTimes) {
    return context._request('/api/constraints', {slackEmail, busyDays, busyTimes});
  },
  cancel: function(slackEmail, meetingTitle, meetingDateTime) {
    return context._request('/api/cancel', {slackEmail, meetingTitle, meetingDateTime});
  },
  nlp: function(text) {
    return context._request('/nlp', {text});
  },
  preferences: function(slackEmail) {
    return context._request('/api/preferences', {slackEmail});
  },
}

module.exports = context;