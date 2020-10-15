module.exports = function(bot) {
    let context = this;

    this.prefix = "maia";
    this.admins = [
        "U01CEG3V7B7", //KPal
    ];

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
        }
    };

    return {
        prefix: this.prefix,
        commands: this.commands,
        admins: this.admins,
    };
};