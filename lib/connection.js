
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

  freeslots(userId) {
    return this._request(`freeslots?userId=${encodeURIComponent(JSON.stringify(userId))}`);
  }
}

module.exports = Connection;