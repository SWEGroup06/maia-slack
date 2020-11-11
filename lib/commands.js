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
    postError(msg, cmdName, error) {
      web.chat.postMessage({
        channel: msg.channel,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${cmdName.toUpperCase()} ERROR*`
            }
          },
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `\`${error}\``,
            }
          }
        ]
      });
    },
    checkForResponseError(res, msg, cmdName) {
      if (!res) {
        context.aux.postError(msg, cmdName, "Invalid object response");
        return true;
      }
      if (res.error) {
        context.aux.postError(msg, cmdName, res.error);
        return true;
      }
      return;
    }
  };

  // Command list
  this.commands = {
    help: {
      desc: `Ask for help`,
      action: function (res, msg) {
        web.chat.postMessage({
          channel: msg.channel,
          blocks:  BLOCKS.help(Object.values(context.commands))
        });
      }
    },

    login: {
      local: true,
      private: true,
      desc: `Login to Maia`,
      action: async function (res, msg) {
        try {
          const res = await conn.login(msg.user, await context.aux.getEmail(msg.user));
          if (context.aux.checkForResponseError(res, 'login')) return;

          if (!res.url && !res.exists) {
            context.aux.postError(msg, this.name, "No url or exists properities found");
            return;
          }

          if (res.url) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `<${res.url}|Click here> to login with Google :key:`
            });
          } else if (res.exists && res.email) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `*You are already signed in with ${res.email}*`
            });
          }
        } catch (error) {
          context.aux.postError(msg, this.name, error);
        }
      }
    },
    logout: {
      local: true,
      private: true,
      desc: `Logout of Maia`,
      action: async function (res, msg) {
        web.chat.postMessage({
          channel: msg.channel,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Are you sure you want to logout?*"
              },
            },
            {
              type: "actions",
              block_id: "logout",
              elements: [
                {
                  action_id: JSON.stringify(await context.aux.getEmail(msg.user)),
                  type: "button",
                  style: "danger",
                  text: {
                    type: "plain_text",
                    text: "Logout"
                  }
                }
              ]
            }
          ]
        });
        // try {
        //   const res = await conn.logout(await context.aux.getEmail(msg.user));
        //   if (context.aux.checkForResponseError(res, 'logout')) return;
        //   web.chat.postMessage({
        //     channel: msg.channel,
        //     text: `\`${res.message}\``
        //   });
        // } catch (error) {
        //   context.aux.postError(msg, this.name, error);
        // }
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
      desc: `Modify your constraints`,
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
          context.aux.postError(msg, this.name, error);
        }
      }
    },

    // Schedule a meeting
    schedule: {
      desc: `Schedule a meeting`,
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
          context.aux.postError(msg, this.name, error);
        }
      }
    }
  };

  Object.keys(this.commands).map(function(key) {
    context.commands[key].name = key;
  });

  return this.commands;
};