const UTILS = require('./utils.js');
const BLOCKS = require('./blocks.js');

const { DateTime, Duration } = require("luxon");

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
              text: `Okay, cool! :thumbsup::skin-tone-4: I'll keep this in mind. :brain:`
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
          ids.unshift(msg.user); // Add organiser's id (user who sent message to maia)
          const emails = await Promise.all(ids.map(context.aux.getEmail))

          // Start datetime of range in which meeting should be scheduled to (as an ISO String).
          let startOfSpecifiedDateRange = DateTime.fromISO(data.time[0].split('+')[0]);
          let endOfSpecifiedDateRange;

          if (data.time.length > 1) {
            endOfSpecifiedDateRange = DateTime.fromISO(data.time[1].split('+')[0]);
          } else {
            endOfSpecifiedDateRange = startOfSpecifiedDateRange.plus({'hour': 1});
          }

          const res = await conn.schedule(emails, startOfSpecifiedDateRange.toISO() , endOfSpecifiedDateRange.toISO());
          if (context.aux.checkForResponseError(res, msg, 'schedule')) return;
          web.chat.postMessage({
            channel: msg.channel,
            text: UTILS.scheduleMessage(res.start, res.end)
          })
        } catch (error) {
          context.aux.postError(msg, this.name, error);
        }
      }
    },
    reschedule: {
      action: async function (data, msg) {
        try {
          // Organiser email
          const email = await context.aux.getEmail(msg.user);

          // Start datetime of meeting to be rescheduled (as an ISO String).
          const oldStartDate = data.oldMeetingDate[0];

          // Start datetime of range in which meeting should be rescheduled to (as an ISO String).
          let newStartDate = DateTime.fromISO(data.newMeetingDate[0]);
          let newEndDate;

          // If the length of newMeetingDate is 1, it specifies a single day only.
          // If the length of newMeetingDate is 2, it specifies several days.
          if (data.newMeetingDate.length > 1) {
            // This means reschedule to any day in a time frame e.g. next week, February, next month, etc.
            newEndDate = DateTime.fromISO(data.newMeetingDate[1]);
          } else if (data.newMeetingDate.length === 1 && data.newMeetingDate[0] === '') {
            // Set a default new start and end date
            newStartDate = DateTime.local();
            newEndDate = newStartDate.plus({days: 14});
          } else {
            // This means reschedule to a specific day! e.g. February 2nd, tomorrow, etc.
            // Create new date which is the end of the day of newStartDate
            if (newStartDate.startOf('day') > DateTime.local().startOf('day')) {
              newStartDate = newStartDate.startOf('day');
            } else {
              newStartDate = DateTime.local();
            }

            newEndDate = newStartDate.endOf('day');
          }

          const res = await conn.reschedule(email, oldStartDate, undefined, newStartDate.toISO(), newEndDate.toISO());

          if (context.aux.checkForResponseError(res, msg, 'reschedule')) return;
          await web.chat.postMessage({
            channel: msg.channel,
            text: `${UTILS.rescheduleMessage(oldStartDate, res.start)}`,
          })
        } catch (error) {
          console.error(error);
          await web.chat.postMessage({
            channel: msg.channel,
            text: `> *RESCHEDULING ERROR: ${error}*` // TODO: Make look nicer
          });
        }
      }
    }
  };

  Object.keys(this.commands).map(function(key) {
    context.commands[key].name = key;
  });

  return this.commands;
};