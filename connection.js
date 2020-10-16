
const fetch = require('node-fetch');

class Connection {
    constructor(url) {
        this.url = url;
    }

    _request(path) {
        return new Promise((resolve, reject) => {
            fetch(`${this.url}/${path}`).then(data => data.json()).then(resolve).catch(reject);
        });
    }

    getFreeSlots() {
        return this._request('api/free-slots');
    }
}

module.exports = Connection;