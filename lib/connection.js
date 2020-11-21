
const fetch = require('node-fetch');

class Connection {
  constructor(url) {
    this.url = url;
  }

  _request(path) {
    let url = `${this.url}${path}`;
    console.log("Fetching:", url);
    return new Promise((resolve, reject) => {
      fetch(url).then((data) => data.json()).then(resolve).catch(reject);
    });
  }

  login(userID, email) {
    return this._request(`/auth/login?userID=${encodeURIComponent(JSON.stringify(userID))}&email=${encodeURIComponent(JSON.stringify(email))}`);
  }
  
  logout(email) {
    return this._request(`/auth/logout?email=${encodeURIComponent(JSON.stringify(email))}`);
  }

  schedule(emails, startDateTimeOfRange, endDateTimeOfRange, flexible) {
    return this._request(`/api/schedule?emails=${encodeURIComponent(JSON.stringify(emails))}
                                    &startDateTimeOfRange=${encodeURIComponent(JSON.stringify(startDateTimeOfRange))}
                                    &endDateTimeOfRange=${encodeURIComponent(JSON.stringify(endDateTimeOfRange))}
                                    &flexible=${encodeURIComponent(JSON.stringify(flexible))}`);
  }

  reschedule(email, startDateTime, endDateTime, newStartDateTime, newEndDateTime) {
    return this._request(`/api/reschedule?organiserSlackEmail=${encodeURIComponent(JSON.stringify(email))}
                                    &eventStartTime=${encodeURIComponent(JSON.stringify(startDateTime))}
                                    &eventEndTime=${encodeURIComponent(JSON.stringify(endDateTime))}
                                    &newStartDateTime=${encodeURIComponent(JSON.stringify(newStartDateTime))}
                                    &newEndDateTime=${encodeURIComponent(JSON.stringify(newEndDateTime))}`)
  }

  constraints(email, busyDays, busyTimes) {
    return this._request(`/api/constraint?email=${encodeURIComponent(JSON.stringify(email))}
                                    &busyDays=${encodeURIComponent(JSON.stringify(busyDays))}
                                    &busyTimes=${encodeURIComponent(JSON.stringify(busyTimes))}`)
  }

  nlp(text) {
    return this._request(`/nlp?text=${encodeURIComponent(JSON.stringify(text))}`)
  }
}

module.exports = Connection;
