
const DEBUG = process.argv.includes('--dev') || false;

module.exports = {
    prefix: 'maia',

    DEBUG,
    BOT_TOKEN: DEBUG ? process.env.MAIA_BETA_BOT_TOKEN : process.env.MAIA_BOT_TOKEN,

    serverURL:  'https://maia-server.herokuapp.com',
    // serverURL:  DEBUG ? 'http://localhost:3000' : 'https://maia-server.herokuapp.com',
};
