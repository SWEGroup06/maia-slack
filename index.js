const SlackClient = require('@slack/client');
const { RTMClient, WebClient  } = SlackClient;

const CONFIG = require('./config.js');

// Slack Interfaces
const rtm = new RTMClient(CONFIG.BOT_TOKEN);
const web = new WebClient(CONFIG.BOT_TOKEN);

const COMMANDS = require('./commands.js')(CONFIG, web);


// Start callback
rtm.on('ready', function() {
    console.log("============================")
    console.log(`BOT is ONLINE`);
    console.log("============================")
});


// Message Event callback 
const msgEventCallback = {
    message: function(msg) {
        let content = msg.text;

        // Discard if no message content or messages without prefix
        if (!content || !content.startsWith(CONFIG.prefix)) return;

        for (let key in COMMANDS) {
            let cmd = COMMANDS[key];

            // Check if command regex matches
            let match = cmd.regex.exec(content);
            if (!match) continue;

            // Perform relevant action
            if (cmd.admin) {
                // Admin only
                if (CONFIG.admins.includes(msg.user)) {
                    cmd.action(msg, match);
                } else {
                    web.chat.postMessage({
                        channel: msg.channel,
                        text: "> *You do not have permission to execute this command. Please contact your administrator to request access.*",
                    });
                }
            } else if (cmd.private) {
                // DMs only
                if (msg.channel[0] === "D") {
                    cmd.action(msg, match);
                } else {
                    web.chat.postMessage({
                        channel: msg.channel,
                        text: "> *This command can only be performed in direct messages*",
                    });
                }
            } else {
                cmd.action(msg, match);
            }

            // Only match one commmand
            break;
        }
    }
}

rtm.on('message', function(data) {
    let cb = msgEventCallback[data.type];
    if (cb) cb(data); 
});

rtm.start();