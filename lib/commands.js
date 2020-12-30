const UTILS = require('./utils.js');
const BLOCKS = require('./blocks.js');

const {DateTime, Duration} = require("luxon");

module.exports = function (CONFIG, web, conn) {
  let context = this;

  // Auxiliary functions
  this.aux = {
    getEmail(user) {
      return new Promise(function (resolve, reject) {
        web.users.info({
          token: CONFIG.BOT_TOKEN,
          user,
        }).then(function (info) {
          resolve(info.user.profile.email);
        }).catch(reject);
      });
    },
    postError(msg, cmdName, error) {
      console.log(`*${cmdName.toUpperCase()} ERROR*`, error);
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
    // TODO: Comment
    help: {
      desc: `Ask for help`,
      action: function (res, msg) {
        web.chat.postMessage({
          channel: msg.channel,
          blocks: BLOCKS.help(Object.values(context.commands))
        });
      }
    },

    // TODO: Comment
    login: {
      local: true,
      private: true,
      desc: `Login to Maia`,
      action: async function (res, msg) {
        try {
          const res = await conn.login(msg.user, await context.aux.getEmail(msg.user));
          if (context.aux.checkForResponseError(res, msg, 'login')) return;

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

    // TODO: Comment
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

    // TODO: Delete?
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
          if (!data.busyTimes || !data.busyTimes.length || !data.busyDays.filter((d) => parseInt(d)).length) {
            web.chat.postMessage({channel: msg.channel, blocks: BLOCKS.constraints});
            return;
          }
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
          const title = data.title;
          const ids = data.people.map((mention) => UTILS.getMentionId(mention.split(" ").join("").toUpperCase()));
          ids.unshift(msg.user); // Add organiser's id (user who sent message to maia)

          const emails = await Promise.all(ids.map(context.aux.getEmail))
          const duration = data.duration;
          const flexibility = data.flexible;

          // Start datetime of range in which meeting should be scheduled to (as an ISO String).
          let startOfSpecifiedDateRange;
          let endOfSpecifiedDateRange;

          // Key of whether the user wants the event to be before or after the date they specified
          const beforeAfterKey = data.beforeAfterKey;

          if (!data.time) {
            // by default set start time to 2 hours from now
            startOfSpecifiedDateRange = DateTime.local().plus(Duration.fromObject({hours: 2}));
            endOfSpecifiedDateRange = startOfSpecifiedDateRange.plus({days: 14});
          } else {
            startOfSpecifiedDateRange = DateTime.max(DateTime.fromISO(data.time[0].split('+')[0]), DateTime.local());
            if (data.time.length > 1) {
              endOfSpecifiedDateRange = DateTime.fromISO(data.time[1].split('+')[0]);
            } else {
              endOfSpecifiedDateRange = startOfSpecifiedDateRange.plus({'hour': 1});
            }
          }

          console.log(title);
          const res = await conn.schedule(title, emails, startOfSpecifiedDateRange.toISO(),
                                          endOfSpecifiedDateRange.toISO(), flexibility, duration, beforeAfterKey);

          if (context.aux.checkForResponseError(res, msg, 'schedule')) return;

            const fields = BLOCKS.confirmation[0].fields;
            if (title.length != 0){
              fields[0].text = "*Name:*\n " + title.substring(1, title.length - 1);
            }
            fields[2].text = "*Start Time:*\n" + DateTime.fromISO(res.start).toLocaleString(DateTime.DATETIME_MED);
            fields[3].text = "*EndTime:*\n " + DateTime.fromISO(res.end).toLocaleString(DateTime.DATETIME_MED);;

            web.chat.postMessage({
              channel: msg.channel,
              blocks: BLOCKS.confirmation,
            });

            if (res.msg) {
              web.chat.postMessage({
                channel: msg.channel,
                text: `${UTILS.postScheduleErrorMessage(res.msg)}`,
              })
            } else {
              web.chat.postMessage({
                channel: msg.channel,
                text: `${UTILS.postScheduleMessage(res.start, res.end, title)}`,
              })
          }
        } catch (error) {
          context.aux.postError(msg, this.name, error);
        }
      }
    },

    // Reschedule a meeting
    reschedule: {
      desc: `Reschedule a meeting`,
      action: async function (data, msg) {
        try {
          // TODO: Uncomment this stuff later
          // if (!data.oldMeetingDate || !data.oldMeetingDate.length || data.oldMeetingDate[0] === '' ||
          //  !data.newMeetingDate || !data.newMeetingDate.length || data.newMeetingDate[0] === '') {
          //   // If some parameters are missing, call upon the block kit UI
          //   web.chat.postMessage({
          //     channel: msg.channel,
          //     blocks: BLOCKS.reschedule,
          //   });
          //   return;
          // }

          // Organiser email
          const email = await context.aux.getEmail(msg.user);

          // Title of meeting, if specified. If unspecified, will be set to 'undefined'
          const meetingTitle = data.meetingTitle;

          // Start datetime of meeting to be rescheduled (as an ISO String).
          const oldStartDate = data.oldMeetingDate[0];

          // Start datetime of range in which meeting should be rescheduled to (as an ISO String).
          let newStartDate = DateTime.fromISO(data.newMeetingDate[0]);
          let newEndDate;

          // Key of whether the user wants the event to be before or after the date they specified
          const beforeAfterKey = data.beforeAfterKey;

          // If the length of newMeetingDate is 1, it specifies a single day only.
          // If the length of newMeetingDate is 2, it specifies several days.
          if (data.newMeetingDate.length > 1) {
            // This means reschedule to any day in a time frame e.g. next week, February, next month, etc.
            newEndDate = DateTime.fromISO(data.newMeetingDate[1]);
          } else if (data.newMeetingDate.length === 1 && data.newMeetingDate[0] === '') {
            // Set a default new start and end date
            // TODO: should this be at least 2 hours from now?
            newStartDate = DateTime.local();
            newEndDate = newStartDate.plus({days: 14});
          } else {
            // This means reschedule to a specific day! e.g. February 2nd, tomorrow, etc.
            // Create new date which is the end of the day of newStartDate
            if (newStartDate.startOf('day') > DateTime.local().startOf('day')) {
              newStartDate = newStartDate.startOf('day');
            } else {
              // TODO: should this be at least 2 hours from now?
              newStartDate = DateTime.local();
            }

            newEndDate = newStartDate.endOf('day');
          }

          const res = await conn.reschedule(email, oldStartDate, undefined, newStartDate.toISO(), newEndDate.toISO(),
                                            meetingTitle, beforeAfterKey);
          if (context.aux.checkForResponseError(res, msg, this.name)) return;
          if (res.msg) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `${UTILS.repostScheduleErrorMessage(res.msg, meetingTitle)}`,
            })
          }
          web.chat.postMessage({
            channel: msg.channel,
            text: `${UTILS.repostScheduleMessage(oldStartDate, res.start, meetingTitle)}`,
          })
        } catch (error) {
          context.aux.postError(msg, this.name, error);
        }
      }
    },

    // Cancel a meeting
    cancel: {
      desc: `Cancel a meeting`,
      action: async function (data, msg) {
        try {
          // Organiser email
          const email = await context.aux.getEmail(msg.user);

          // Title of meeting, if specified. If unspecified, will be set to 'undefined'
          const meetingTitle = data.meetingTitle;

          // The exact date and time of a meeting, if specified.
          const meetingDateTime = data.meetingDateTime;

          const res = await conn.cancel(email, meetingTitle, meetingDateTime);

          if (context.aux.checkForResponseError(res, msg, 'cancel')) return;

          if (res.msg) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `${UTILS.postCancelErrorMessage(res.msg)}`,
            })
          } else {
            web.chat.postMessage({
              channel: msg.channel,
              text: `${UTILS.postCancelMessage(res.title, res.dateTime)}`,
            })
          }
        } catch(error) {
          context.aux.postError(msg, this.name, error);
        }
      }
    },

    // Recalculate historical preferences
    recalibrate: {
      desc: `Recalibrate my preferences`,
      action: async function (data, msg) {
        try {
          const res = await conn.generatePreferences(await context.aux.getEmail(msg.user));
          if (context.aux.checkForResponseError(res, msg, 'recalibrate')) return;
          if (res.success) {
            await web.chat.postMessage({
              channel: msg.channel,
              text: `Your historical time preferences are being recalculated, this will only take a couple minutes`
            })
          }
        } catch (error) {
          context.aux.postError(msg, this.name, error);
        }
      },
    },
    // TODO: Temporarily as 'tp', which will soon be 'reschedule'
    tp: {
      desc: `I am tp`,
      action: async function (data, msg) {
        try {
          console.log("FRONT END TP DATA **********");
          console.log(data);
          console.log("****************************");

          // Organiser email (associated with their Google account)
          const email = await context.aux.getEmail(msg.user);

          const res = await conn.tp(email, data.oldTitle, data.oldDateTime, data.newStartDateRange,
                        data.newEndDateRange, data.newStartTimeRange, data.newEndTimeRange, data.newDayOfWeek);

          if (context.aux.checkForResponseError(res, msg, 'cancel')) return;

          if (res.msg) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `${UTILS.repostScheduleErrorMessage(res.msg, data.oldTitle)}`,
            })
          }
          web.chat.postMessage({
            channel: msg.channel,
            text: `${UTILS.repostScheduleMessage(data.oldDateTime, res.start, data.oldTitle)}`,
          })
        } catch (error) {
          context.aux.postError(msg, this.name, error);
        }
      }
    }
  };

  Object.keys(this.commands).map(function (key) {
    context.commands[key].name = key;
  });

  return this.commands;
};