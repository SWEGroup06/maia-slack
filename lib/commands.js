const UTILS = require('./utils.js');
const BLOCKS = require('./blocks.js')

module.exports = function(CONFIG, web, conn) {
  let context = this;

  // Auxiliary functions
  this.aux = {
    getEmail(user) {
      return new Promise(function(resolve, reject) {
        web.users.info({
          token: CONFIG.BOT_TOKEN,
          user,
        }).then(function(info) {
          resolve(info.user.profile.email);
        }).catch(reject);
      });
    },
    checkForResponseError(res, msg, cmdName) {
      if (!res) {
        web.chat.postMessage({
          channel: msg.channel,
          text: `> *${cmdName.toUpperCase()} ERROR: Invalid object response*`
        });
        return true;
      }
      if (res.error) {
        web.chat.postMessage({
          channel: msg.channel,
          text: `> *${cmdName.toUpperCase()} ERROR: ${res.error}*`
        });
        return true;
      }
      return;
    }
  };

  // Command list
  this.commands = {
    help: {
      desc: `Help menu`,
      action: function (msg) {
        web.chat.postMessage({
          channel: msg.channel,
          text: `How may I help? :blush: \nHere's what you can ask me to do: \n> \`\`\`${Object.keys(context.commands).map(key => `- ${context.commands[key].desc}`).join("\n")}\`\`\``
        });
      }
    },

    login: {
      local: true,
      private: true,
      desc: `Command to login to Maia`,
      action: async function (msg) {
        try {
          const res = await conn.login(msg.user, await context.aux.getEmail(msg.user));
          if (context.aux.checkForResponseError(res, 'login')) return;

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
    logout: {
      local: true,
      private: true,
      desc: `Command to logout of Maia`,
      action: async function (msg) {
        try {
          const res = await conn.logout(await context.aux.getEmail(msg.user));
          if (context.aux.checkForResponseError(res, 'logout')) return;

          web.chat.postMessage({
            channel: msg.channel,
            text: `> *${res.message}*`
          });
        } catch (error) {
          await web.chat.postMessage({
            channel: msg.channel,
            text: `> *LOGOUT ERROR: ${error}*`
          });
        }
      }
    },

    // rescheduleWithUI: {
    //   desc: `${CONFIG.prefix} reschedule`,
    //   regex: new RegExp(`${CONFIG.prefix} reschedule`, 'i'),
    //   action: async function (msg) {
    //     await web.chat.postMessage({
    //       channel: msg.channel,
    //       blocks: BLOCKS.reschedule,
    //       // email: context.aux.getEmail(msg.user)
    //     });
    //   }
    // },

    // Add new constraints
    constraint: {
      desc: `Enables you to add new constraints to your week`,
      action: async function (data, msg) {
        try {
          const res = await conn.constraints(await context.aux.getEmail(msg.user), data.busyDays, data.busyTimes);
          if (context.aux.checkForResponseError(res, msg, 'constraint')) return;
          if (res.success) {
            await web.chat.postMessage({
              channel: msg.channel,
              text: `> Ihowa has a lot of money` // TODO: Make look nicer
            })
          }
        } catch (error) {
          await web.chat.postMessage({
            channel: msg.channel,
            text: `> *CONSTRAINT ERROR: ${error}*` // TODO: Make look nicer
          });
        }
      }
    },

    // Schedule a meeting
    schedule: {
      desc: `To schedule a meeting with any number of people`,
      action: async function (data, msg) {
        try {
          const ids = data.people.map((mention) => UTILS.getMentionId(mention.split(" ").join("").toUpperCase()));
          const emails = await Promise.all([msg.user, ...ids].map(context.aux.getEmail));
          const res = await conn.schedule(emails, data.time[0] , data.time[1]);
          if (context.aux.checkForResponseError(res, msg, 'schedule')) return;
          await web.chat.postMessage({
            channel: msg.channel,
            text: JSON.stringify(res) // TODO: Make look nicer
          })
        } catch (error) {
          await web.chat.postMessage({
            channel: msg.channel,
            text: `> *SCHEDULING ERROR: ${error}*` // TODO: Make look nicer
          });
        }
      }
    }
  };

  return this.commands;
};