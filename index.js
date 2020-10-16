const SlackBot = require('slackbots');

// Initiate bot
const bot = new SlackBot({
    token: process.env.MAIA_BOT_TOKEN,
    name: 'Maia'
});

const CONSTS = require('./consts.js')(bot);

// Start callback
bot.on('start', function() {
    console.log("============================")
    console.log(`${bot.name} is ONLINE`);
    console.log("============================")
});


// Message Event callback 
const msgEventCallback = {
    message: function(msg) {
        let content = msg.text;

        // Discard if no message content or messages without prefix
        if (!content || !content.startsWith(CONSTS.prefix)) return;

        for (let key in CONSTS.commands) {
            let cmd = CONSTS.commands[key];

            // Check if command regex matches
            let match = cmd.regex.exec(content);
            if (!match) continue;

            // Perform relevant action
            if (cmd.admin) {
                // Admin only
                if (CONSTS.admins.includes(msg.user)) {
                    cmd.action(msg, match);
                } else {
                    bot.postMessage(msg.channel, "> *You do not have permission to execute this command. Please contact your administrator to request access.*");
                }
            } else if (cmd.private) {
                // DMs only
                if (msg.channel[0] === "D") {
                    cmd.action(msg, match);
                } else {
                    bot.postMessage(msg.channel, "> *This command can only be performed in direct messages*");
                }
            } else {
                cmd.action(msg, match);
            }

            // Only match one commmand
            break;
        }
    }
}

bot.on('message', function(data) {
    let cb = msgEventCallback[data.type];
    if (cb) cb(data); 
});