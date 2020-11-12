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
      private: true,
      desc: `${CONFIG.prefix} logout`,
      regex: new RegExp(`${CONFIG.prefix} logout`, 'i'),
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
      // action: async function (msg, match) {
      //   let userIDs = new Set();
      //   userIDs.add(msg.user);
      //   match.slice(1).forEach(function (id) {
      //     userIDs.add(id);
      //   });
      //
      //   try {
      //     const res = await conn.schedule(await Promise.all([...userIDs].map(context.aux.getEmail)));
      //     if (context.aux.checkForResponseError(res, 'meeting')) return;
      //
      //     web.chat.postMessage({
      //       channel: msg.channel,
      //       text: `> I've booked a meeting from \*${UTILS.formatDate(res.start)}\* to \*${UTILS.formatDate(res.end)}\* :spiral_calendar_pad:\n To reschedule, use \`maia reschedule\``
      //     });
      //   } catch (error) {
      //     web.chat.postMessage({
      //       channel: msg.channel,
      //       text: `> *MEETING ERROR: ${error}*` // TODO: Make look nicer
      //     });
      //   }
      // }
    },
    _reschedule: {
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
          const res = await conn.reschedule(await context.aux.getEmail(msg.user), startDate, endDate)
          if (context.aux.checkForResponseError(res, 'reschedule')) return;

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
          blocks: BLOCKS.constraints,
          email: context.aux.getEmail(msg.user)
        });
      }
    },
    rescheduleWithUI: {
      desc: `${CONFIG.prefix} reschedule`,
      regex: new RegExp(`${CONFIG.prefix} reschedule`, 'i'),
      action: async function (msg) {
        await web.chat.postMessage({
          channel: msg.channel,
          blocks: BLOCKS.reschedule,
          email: context.aux.getEmail(msg.user)
        });
      }
    },

    // dialogflow
    constraint: {
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
    schedule: {
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
          await web.chat.postMessage({
            channel: msg.channel,
            text: `> *SCHEDULING ERROR: ${error}*` // TODO: Make look nicer
          });
        }
      }
    },
    reschedule: {
      action: async function (data, msg) {
        console.log("**************\n")
        console.log(data);
        console.log("**************\n")
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

  return this.commands;
};