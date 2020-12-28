const CONFIG = require('../config.js');

const axios = require('axios');

const context = {
  _request: async function(path, params) {
    // Encode each parameter
    Object.keys(params).forEach(p => params[p] = encodeURIComponent(JSON.parse(params[p])));

    // Make request
    return await axios.get(CONFIG.serverURL + path, {params});
  },
  login: function(googleEmail, slackEmail, slackId) {
    return context._request('/auth/login', {googleEmail, slackEmail, slackId});
  },
  logout: function(email) {
    return context._request('/auth/logout', {email});
  },
  schedule: function(title, emails, startDateTimeOfRange, endDateTimeOfRange, flexible, duration, beforeAfterKey) {
    return context._request('/auth/logout', {email});
  },
  reschedule: function(email, startDateTime, endDateTime, newStartDateTime, newEndDateTime, meetingTitle, beforeAfterKey) {
    return context._request('/api/reschedule', {email, startDateTime, endDateTime, newStartDateTime, newEndDateTime, meetingTitle, beforeAfterKey});
  },
  constraints: function(email, busyDays, busyTimes) {
    return context._request('/api/constraints', {email, busyDays, busyTimes});
  },
  cancel: function(email, meetingTitle, meetingDateTime) {
    return context._request('/api/cancel', {email, meetingTitle, meetingDateTime});
  },
  nlp: function(text) {
    return context._request('/nlp', {text});
  },
  preferences: function(email) {
    return context._request('/api/preferences', {email});
  },
}

module.exports = context;