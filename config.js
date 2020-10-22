
const fs = require('fs');
const ENV = fs.existsSync('./.env.json') ? require('./.env.json') : process.env;

module.exports = {
    prefix: "maia",

    admins: [
        "U01CEG3V7B7", //KPal
    ],

    BOT_TOKEN: ENV.BOT_TOKEN,

    serverURL: 'https://maia-server.herokuapp.com/',
}