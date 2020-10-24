
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

  _compoundKeyURLComponent(userID, teamID) {
    return `userID=${encodeURIComponent(JSON.stringify(userID))}&teamID=${encodeURIComponent(JSON.stringify(teamID))}`;
  }

  login(userID, teamID) {
    return this._request(`login?${this._compoundKeyURLComponent(userID, teamID)}`);
  }

  freeslots(userID, teamID, startDate, endDate) {
    return this._request(`freeslots?${this._compoundKeyURLComponent(userID, teamID)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
  }

  meeting(userIDs, teamID) {
    return this._request(`meeting?userIDs=${encodeURIComponent(JSON.stringify(userIDs))}&teamID=${encodeURIComponent(JSON.stringify(teamID))}`);
  }
}

module.exports = Connection;
