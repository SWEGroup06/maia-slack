
const DEBUG = process.argv.includes('--dev') || false;

module.exports = {
    prefix: 'maia',

    admins: [
        'U01CEG3V7B7', // KPal
    ],

    DEBUG,
    BOT_TOKEN: DEBUG ? process.env.MAIA_BETA_BOT_TOKEN : process.env.MAIA_BOT_TOKEN,

    serverURL: 'https://maia-server.herokuapp.com',
};
