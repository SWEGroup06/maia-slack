const SlackClient = require('@slack/client');
const { RTMClient, WebClient } = SlackClient;

// Load environment variables
require('dotenv').config();

const CONFIG = require('./config.js');

// Slack Interfaces
const rtm = new RTMClient(CONFIG.BOT_TOKEN);
const web = new WebClient(CONFIG.BOT_TOKEN);

const COMMANDS = require('./lib/commands.js')(CONFIG, web);


// Start callback
rtm.on('ready', function () {
  console.log('============================');
  console.log(`Maia ${CONFIG.DEBUG ? "(BETA)" : ""} is ONLINE`);
  console.log('============================');
});


// Message Event callback
const msgEventCallback = {
  message: function (msg) {
    const content = msg.text;

    // Discard if no message content or messages without prefix
    if (!content || !content.startsWith(CONFIG.prefix)) return;

    for (const key in COMMANDS) {
      const cmd = COMMANDS[key];

      // Check if command regex matches
      const match = cmd.regex.exec(content);
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
      break;
    }
  },
};

rtm.on('message', function (data) {
  const cb = msgEventCallback[data.type];
  if (cb) cb(data);
});

rtm.start();
