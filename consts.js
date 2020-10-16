const Connection = require('./connection.js');


module.exports = function(bot) {
    let context = this;

    this.prefix = "maia";
    this.admins = [
        "U01CEG3V7B7", //KPal
    ];

    this.url = 'http://localhost:5000'; //Add remote address for heroku
    this.conn = new Connection(this.url);

    this.commands = {
        help: {
            desc: `${this.prefix} help`,
            regex: new RegExp(`${this.prefix} help`, 'g'),
            action: function(msg) {
                bot.postMessage(msg.channel,  `> *Help*\n> \`\`\`${Object.keys(context.commands).map(key => `- ${context.commands[key].desc}`).join("\n")}\`\`\``);
            }
        },
        say: {
            admin: true,
            desc: `${this.prefix} say <message>`,
            regex: new RegExp(`${this.prefix} say (.+)`, 'g'),
            action: function(msg, match) {
                bot.postMessage(msg.channel, match[1]);
            }
        },
        login: {
            private: true,
            desc: `${this.prefix} login <email>`,
            regex: new RegExp(`${this.prefix} login (.+)`, 'g'),
            action: function(msg, match) {
                bot.postMessage(msg.channel, `> *Follow the link to sign in*\nhttps://calendar.google.com/calendar/embed?src=${match[1]}@gmail.com`);
            }
        },
        freeSlots: {
            desc: `${this.prefix} free slots`,
            regex: new RegExp(`${this.prefix} free slots`, 'g'),
            action: function(msg, match) {
                context.conn.getFreeSlots().then(function(slots) {
                    bot.postMessage(msg.channel, `> *Free Slots*\n> \`\`\`${slots.map(period => `${new Date(period.start).toGMTString()} - ${new Date(period.end).toGMTString()}`).join("\n")}\`\`\``);
                }).catch(function(err) {
                    bot.postMessage(msg.channel, `> *Error*\n> \`\`\`${err}\`\`\``);
                })
            }
        }
    };

    return {
        prefix: this.prefix,
        commands: this.commands,
        admins: this.admins,
    };
};