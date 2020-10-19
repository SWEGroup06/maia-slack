
const fs = require('fs');
const ENV = fs.existsSync('./.env.json') ? require('./.env.json') : process.env;

module.exports = {
    prefix: "maia",

    admins: [
        "U01CEG3V7B7", //KPal
    ],

    BOT_TOKEN: ENV.BOT_TOKEN,

    serverURL: 'https://maia-server.herokuapp.com/',

    CLIENT_ID: ENV.CLIENT_ID,
    CLIENT_SECRET: ENV.CLIENT_SECRET,
}