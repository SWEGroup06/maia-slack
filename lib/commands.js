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
            text: `> ${JSON.stringify(res)}`
          });
        } catch (error) {
          web.chat.postMessage({
            channel: msg.channel,
            text: `> *MEETING ERROR: ${error}*` // TODO: Make look nicer
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