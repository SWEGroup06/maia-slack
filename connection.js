
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

    userLogin(user, tokens) {
        return this._request(`login?user=${encodeURIComponent(JSON.stringify(user))}&tokens=${encodeURIComponent(JSON.stringify(tokens))}`);
    }
}

module.exports = Connection;