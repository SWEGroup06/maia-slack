const Connection = require('./connection.js');
const UTILS = require('./utils.js');
const UI = require('./ui/constraints.js')

module.exports = function (CONFIG, web) {

  let context = this;

  // Connection Interface
  this.conn = new Connection(CONFIG.serverURL);

  const getEmail = function (user) {
    return new Promise(function (resolve, reject) {
      web.users.info({
        token: CONFIG.BOT_TOKEN,
        user,
      }).then(function (info) {
        resolve(info.user.profile.email);
      }).catch(reject);
    });
  }

  this.commands = {
    help: {
      desc: `${CONFIG.prefix} help`,
      regex: new RegExp(`${CONFIG.prefix} help`, 'i'),
      action: function (msg) {
        web.chat.postMessage({
          channel: msg.channel,
          text: `How may I help? :blush: \nHere's what you can ask me to do: \n> \`\`\`${Object.keys(context.commands).map(key => `- ${context.commands[key].desc}`).join("\n")}\`\`\``
        });
      }
    },
    login: {
      private: true,
      desc: `${CONFIG.prefix} login`,
      regex: new RegExp(`${CONFIG.prefix} login`, 'i'),
      action: async function (msg) {
        try {
          const res = await context.conn.login(msg.user, await getEmail(msg.user));
          if (!res) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *LOGIN ERROR: Invalid object response*`
            });
            return;
          }
          if (res.error) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *LOGIN ERROR: ${res.error}*`
            });
            return;
          }
          if (!res.url && !res.exists) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *LOGIN ERROR: No url or exists properities found*`
            });
            return;
          }

          if (res.url) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `<${res.url}|Click here> to login with Google :key:`
            });
          } else {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *You are already signed in*`
            });
          }
        } catch (error) {
          web.chat.postMessage({
            channel: msg.channel,
            text: `> *LOGIN ERROR: ${error}*`
          });
        }
      }
    },
    meeting: {
      private: true,
      desc: `${CONFIG.prefix} meeting <mentions...>`,

      /**
       * Checks for 'meeting' keyword, if so then checks if an
       * argument is a mention (@) or not.
       *
       * Returns an array containing the user IDs which were
       * mentioned as well as the original message.
       *
       * @param str
       * @return {unknown[]|null}
       */
      search: function (str) {
        str = str.replace(/\s/g, " ");
        let parts = str.split(`${CONFIG.prefix} meeting`);
        if (parts[0] == str) return null;
        let args = parts[1].split(" ").filter(p => p);
        if (!UTILS.allTrue(args.map(UTILS.isMentionId))) return null;
        return [str, ...args.map(UTILS.getMentionId)];
      },

      /**
       *
       *
       * @param msg (Message object - content, user, etc.)
       * @param match (Array returned from search or regex)
       * @return {Promise<void>}
       */
      action: async function (msg, match) {
        let userIDs = new Set();
        userIDs.add(msg.user);
        match.slice(1).forEach(function (id) {
          userIDs.add(id);
        });

        try {
          const res = await context.conn.meeting(await Promise.all([...userIDs].map(getEmail)));
          if (!res) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *MEETING ERROR: Invalid object response*`
            });
            return;
          }
          if (res.error) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *MEETING ERROR: ${res.error}*`
            });
            return;
          }

          web.chat.postMessage({
            channel: msg.channel,
            text: `I've booked a meeting from \*${UTILS.formatDate(res.start)}\* to \*${UTILS.formatDate(res.end)}\*  :spiral_calendar_pad:\n To reschedule, use \`maia reschedule\``
          });

        } catch (error) {
          web.chat.postMessage({
            channel: msg.channel,
            text: `> *MEETING ERROR: ${error}*` // TODO: Make look nicer
          });
        }
      }
    },
    reschedule: {
      private: true,
      desc: `${CONFIG.prefix} reschedule <date> <month> <time> - <date> <month> <time> (12 hour format for time)`,
      regex: new RegExp(`${CONFIG.prefix} reschedule (\\d{1,2})\\w{2} (\\w+) (\\d{1,2}:\\d{1,2})(\\w{2}) - (\\d{1,2})\\w{2} (\\w+) (\\d{1,2}:\\d{1,2})(\\w{2})`, 'i'),
      /**
       * regex[1] = startTime
       * regex[2] = endTime
       *
       * @param {Object} msg: Object given by slack: message content, userID, email, etc.
       * @param {Array} match: result of 'regex' above
       * @return {Promise<null>}
       */
      action: async function (msg, match) {
        const startDate = UTILS.parseDate(match[1], match[2], match[3], match[4]);
        const endDate = UTILS.parseDate(match[5], match[6], match[7], match[8]);
        if (!startDate || !endDate) {
          web.chat.postMessage({
            channel: msg.channel,
            text: `> *RESCHEDULE ERROR: Invalid date format*`
          });
          return;
        }
        try {
          const res = await context.conn.reschedule(await getEmail(msg.user), startDate, endDate)
          if (!res) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *RESCHEDULE ERROR: Invalid object response*`
            });
            return;
          }
          if (res.error) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *RESCHEDULE ERROR: ${res.error}*`
            });
            return;
          }
          web.chat.postMessage({
            channel: msg.channel,
            text: `> ${JSON.stringify(res)}` // TODO: Make look nicer
          });
        } catch (error) {
          web.chat.postMessage({
            channel: msg.channel,
            text: `> *RESCHEDULE ERROR: ${error}*`
          });
        }
      }
    },
    addConstraint: {
      desc: `${CONFIG.prefix} add constraint`,
      regex: new RegExp(`${CONFIG.prefix} add constraint`, 'i'),
      action: async function (msg) {
        await web.chat.postMessage({
          channel: msg.channel,
          text: `> *Add constraint*\n> \`\`\`${Object.keys(context.commands).map(key => `- ${context.commands[key].desc}`).join("\n")}\`\`\``,
          blocks: UI.constraints,
          email: getEmail(msg.user)
        });
      }
    },
    logout: {
      private: true,
      desc: `${CONFIG.prefix} logout`,
      regex: new RegExp(`${CONFIG.prefix} logout`, 'i'),
      action: async function (msg) {
        try {
          const res = await context.conn.logout(await getEmail(msg.user));
          if (!res) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *LOGOUT ERROR: You aren't logged in*`
            });
            return;
          }
          if (res.error) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *LOGOUT ERROR: ${res.error}*`
            });
            return;
          }
          web.chat.postMessage({
            channel: msg.channel,
            text: `${res.message}`
            // text: `Logout successful. Dont worry, 'I'll still be here to help when you're back :wave::skin-tone-3:`
          });
        } catch (error) {
          await web.chat.postMessage({
            channel: msg.channel,
            text: `> *LOGOUT ERROR: ${error}*`
          });
        }
      }
    },
  };

  return this.commands;
};