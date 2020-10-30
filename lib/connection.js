
const fetch = require('node-fetch');

class Connection {
  constructor(url) {
    this.url = url;
  }

  _request(path) {
    let url = `${this.url}/${path}`;
    console.log("Fetching:", url);
    return new Promise((resolve, reject) => {
      fetch(`${this.url}/${path}`).then((data) => data.json()).then(resolve).catch(reject);
    });
  }

  login(userID, email) {
    return this._request(`login?userID=${encodeURIComponent(JSON.stringify(userID))}&email=${encodeURIComponent(JSON.stringify(email))}`);
  }

  meeting(emails) {
    return this._request(`meeting?emails=${encodeURIComponent(JSON.stringify(emails))}`);
  }

  constraint(email, startTime, endTime, dayOfWeek) {
    return this._request(`constraint?email=${encodeURIComponent(JSON.stringify(email))}
                                    &startTime=${encodeURIComponent(JSON.stringify(startTime))}
                                    &endTime=${encodeURIComponent(JSON.stringify(endTime))}
                                    &dayOfWeek=${encodeURIComponent(JSON.stringify(dayOfWeek))}`)
  }

  reschedule(email, startDateTime, endDateTime) {
    return this._request(`reschedule?organiserSlackEmail=${encodeURIComponent(JSON.stringify(email))}
                                    &eventStartTime=${encodeURIComponent(JSON.stringify(startDateTime))}
                                    &eventEndTime=${encodeURIComponent(JSON.stringify(endDateTime))}`)
  }
}

module.exports = Connection;
