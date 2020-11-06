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
  message: function (msg) {
    const content = msg.text;

    // Discard if no message content or messages without prefix
    if (!content || !content.startsWith(CONFIG.prefix)) return;
  

    for (const key in COMMANDS) {
      const cmd = COMMANDS[key];

      // Check if command regex matches
      const match = cmd.regex ? cmd.regex.exec(content) : cmd.search(content);
      // console.log(content, cmd.regex, match);
      if (!match) continue;

      // Perform relevant action
      if (cmd.private) {
        // DMs only
        if (msg.channel[0] === 'D') {
          cmd.action(msg, match);
        } else {
          web.chat.postMessage({
            channel: msg.channel,
            text: '> *This command can only be performed in direct messages*',
          });
        }
      } else {
        cmd.action(msg, match);
      }

      // Only match one commmand
      return;
    }

    if (content.toLowerCase().startsWith("maia")) {
      web.chat.postMessage({
        channel: msg.channel,
        text: `> *${[
          'Sorry I didnt quite catch that. Could you repeat that again?',
          'Please try again.',
          'Sorry I didnt understand your command. Refer to the help menu (\`maia help\`) and try again',
        ][UTILS.random(3)]}*`
      })
    }
  },
};

rtm.on('message', function (data) {
  const handler = msgEventHandlers[data.type];
  if (handler) handler(data);
});

rtm.start();
