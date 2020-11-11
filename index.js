const SlackClient = require('@slack/client');
const { RTMClient, WebClient } = SlackClient;

// Load environment variables
require('dotenv').config();

const CONFIG = require('./config.js');
const UTILS = require('./lib/utils.js');

// Slack Interfaces
const rtm = new RTMClient(CONFIG.BOT_TOKEN);
const web = new WebClient(CONFIG.BOT_TOKEN);

const Connection = require('./lib/connection.js');
const conn = new Connection(CONFIG.serverURL);

const COMMANDS = require('./lib/commands.js')(CONFIG, web, conn);

// Start callback
rtm.on('ready', function () {
  console.log('============================');
  console.log(`Maia ${CONFIG.DEBUG ? "(BETA)" : ""} is ONLINE`);
  console.log(`Server URL: ${CONFIG.serverURL}`);
  console.log('============================');
});

// Message Event callback
const msgEventHandlers = {
  message: async function (msg) {
    const content = msg.text;

    // Discard if no message content or messages without prefix
    if (!content || !content.startsWith(CONFIG.prefix)) return;

    try {
      const res = await conn.nlp(content);
      const cmd = COMMANDS[res.type];
      if (cmd && cmd.action) await cmd.action(res, msg);
    } catch (error) {
      console.error(error);
      return;
    }
  },
};

rtm.on('message', async function (data) {
  const handler = msgEventHandlers[data.type];
  if (handler) {
    await handler(data);
  }
});

rtm.start();
