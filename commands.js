const Connection = require('./connection.js');

const AUTH = require('./auth.js');


module.exports = function(CONFIG, web) {
    let context = this;

    // Connection Interface
    this.conn = new Connection(CONFIG.serverURL);

    // Login Map
    this.login = {};

    this.commands = {
        help: {
            desc: `${CONFIG.prefix} help`,
            regex: new RegExp(`${CONFIG.prefix} help`, 'g'),
            action: function(msg) {
                web.chat.postMessage({
                    channel: msg.channel,
                    text: `> *Help*\n> \`\`\`${Object.keys(context.commands).map(key => `- ${context.commands[key].desc}`).join("\n")}\`\`\``
                });
            }
        },
        say: {
            admin: true,
            desc: `${CONFIG.prefix} say <message>`,
            regex: new RegExp(`${CONFIG.prefix} say (.+)`, 'g'),
            action: function(msg, match) {
                web.chat.postMessage({
                    channel: msg.channel,
                    text: match[1]
                });
            }
        },
        login: {
            private: true,
            desc: `${CONFIG.prefix} login`,
            regex: new RegExp(`${CONFIG.prefix} login`, 'g'),
            action: function(msg, match) {
                if (!context.login[msg.user]) context.login[msg.user] = true;
                web.chat.postMessage({
                    channel: msg.channel,
                    text: `> *Click <${AUTH.generateAuthUrl()}|here> to sign in*\n> *Verify with provided token by entering* \`maia verify <YOUR_TOKEN>\``
                });
            }
        },
        verify: {
            private: true,
            desc: `${CONFIG.prefix} verify <token>`,
            regex: new RegExp(`${CONFIG.prefix} verify (.+)`, 'g'),
            action: function(msg, match) {
                if (context.login[msg.user]) {
                    AUTH.getTokens(match[1]).then(function(tokens) {
                        context.conn.userLogin(msg.user, tokens).then(function() {
                            delete context.login[msg.user];
                            web.chat.postMessage({
                                channel: msg.channel,
                                text: `> *Verification Successful \`${JSON.stringify(tokens)}\`*`
                            });
                        }).catch(function(err) {
                            web.chat.postMessage({
                                channel: msg.channel,
                                text: `> *Verification Error: \`${err}\`*`
                            });
                        })
                    }).catch(function(err) {
                        web.chat.postMessage({
                            channel: msg.channel,
                            text: `> *Verification Error: \`${err}\`*`
                        });
                    });
                } else {
                    web.chat.postMessage({
                        channel: msg.channel,
                        text: `> *You have not started to sign in in. Type \`maia login\` to begin*`
                    });
                }
            }
        },
        freeSlots: {
            desc: `${CONFIG.prefix} free slots`,
            regex: new RegExp(`${CONFIG.prefix} free slots`, 'g'),
            action: function(msg) {
                context.conn.getFreeSlots().then(function(slots) {
                    web.chat.postMessage({
                        channel: msg.channel, 
                        text: `> *Free Slots*\n> \`\`\`${slots.map(period => `${new Date(period.start).toGMTString()} - ${new Date(period.end).toGMTString()}`).join("\n")}\`\`\``
                    });
                }).catch(function(err) {
                    web.chat.postMessage({
                        channel: msg.channel, 
                        text: `> *Error*\n> \`\`\`${err}\`\`\``
                    });
                })
            }
        }
    };

    return this.commands;
};

//https://maia-server.herokuapp.com/oauth2callback?state=%257B%2522auth_id%2522%253A%2522U01CEG3V7B7%2522%257D&code=4/0AfDhmrjE1Xlm8byznfxAbkZ1yDx1X7L3scCesEsOeDHFBTVtS10iVkkQvqi_Ut9S1E3nIA&scope=openid%20https://www.googleapis.com/auth/calendar&authuser=0&prompt=consent