
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

  schedule(emails) {
    return this._request(`/api/schedule?emails=${encodeURIComponent(JSON.stringify(emails))}`);
  }

  reschedule(email, startDateTime, endDateTime) {
    return this._request(`/api/reschedule?organiserSlackEmail=${encodeURIComponent(JSON.stringify(email))}
                                    &eventStartTime=${encodeURIComponent(JSON.stringify(startDateTime))}
                                    &eventEndTime=${encodeURIComponent(JSON.stringify(endDateTime))}`)
  }
}

module.exports = Connection;
