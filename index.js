const SlackClient = require('@slack/client');
const { RTMClient, WebClient } = SlackClient;

// Load environment variables
require('dotenv').config();

// Slack Interfaces
const rtm = new RTMClient(process.env.MAIA_BOT_TOKEN);
const web = new WebClient(process.env.MAIA_BOT_TOKEN);

const CONFIG = require('./config.js');
const COMMANDS = require('./lib/commands.js')(CONFIG, web);


// Start callback
rtm.on('ready', function () {
  console.log('============================');
  console.log(`Maia is ONLINE`);
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
      if (cmd.admin) {
        // Admin only
        if (CONFIG.admins.includes(msg.user)) {
          cmd.action(msg, match);
        } else {
          web.chat.postMessage({
            channel: msg.channel,
            text: `> *You do not have permission to execute this command. 
                Please contact your administrator to request access.*`,
          });
        }
      } else if (cmd.private) {
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
