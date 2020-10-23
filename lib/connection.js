
const fetch = require('node-fetch');

class Connection {
  constructor(url) {
    this.url = url;
  }

  _request(path) {
    return new Promise((resolve, reject) => {
      fetch(`${this.url}/${path}`).then((data) => data.json()).then(resolve).catch(reject);
    });
  }

  login(userId) {
    return this._request(`login?userId=${encodeURIComponent(JSON.stringify(userId))}`);
  }

  freeslots(userId, startDate, endDate) {
    return this._request(`freeslots?userId=${encodeURIComponent(userId)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
  }

  meeting(userIds) {
    return this._request(`meeting?userIds=${encodeURIComponent(JSON.stringify(userIds))}`);
  }
}

module.exports = Connection;
