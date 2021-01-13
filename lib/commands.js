const UTILS = require("./utils.js");
const BLOCKS = require("./blocks.js");

const { DateTime } = require("luxon");

module.exports = function (CONFIG, web, CONN) {
  const context = this;

  // Auxiliary functions
  this.aux = {
    getEmail(user) {
      return new Promise(function (resolve, reject) {
        web.users
          .info({
            token: CONFIG.BOT_TOKEN,
            user,
          })
          .then(function (info) {
            resolve(info.user.profile.email);
          })
          .catch(reject);
      });
    },
    postWarn(msg, cmdName, info) {
      console.warn(`*${cmdName.toUpperCase()} WARN*`, info);
      const warn = UTILS.message.warn();
      web.chat.postMessage({
        channel: msg.channel,
        text: warn,
      });
    },
    postError(msg, cmdName, error) {
      console.error(`*${cmdName.toUpperCase()} ERROR*`, error);
      web.chat.postMessage({
        channel: msg.channel,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${cmdName.toUpperCase()} ERROR*`,
            },
          },
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `\`${error}\``,
            },
          },
        ],
      });
    },
    postConfirm(res, msg, data) {
      const editButton = BLOCKS.confirmation[1].elements[0];
      const cancelButton = BLOCKS.confirmation[1].elements[1];
      editButton.value = res.id;
      cancelButton.value = res.id;
      const fields = BLOCKS.confirmation[0].fields;
      if (data.title && data.title.length !== 0) {
        fields[0].text =
          "*Name:*\n " + data.title.substring(1, data.title.length - 1);
      } else if (data.oldTitle && data.oldTitle.length !== 0) {
        fields[0].text =
          "*Name:*\n " + data.oldTitle.substring(1, data.oldTitle.length - 1);
      } else {
        fields[0].text = "*Name:*\n Maia Event";
      }
      fields[2].text =
        "*Start time:*\n" +
        DateTime.fromISO(res.start).toLocaleString(DateTime.DATETIME_MED);
      fields[3].text =
        "*End time:*\n " +
        DateTime.fromISO(res.end).toLocaleString(DateTime.DATETIME_MED);
      web.chat.postMessage({
        channel: msg.channel,
        blocks: BLOCKS.confirmation,
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
    },
  };

  // Command list
  this.commands = {
    help: {
      desc: `Ask for help`,
      action: function (data, msg) {
        web.chat.postMessage({
          channel: msg.channel,
          blocks: BLOCKS.help(Object.values(context.commands)),
        });
      },
    },

    login: {
      desc: `Login to Maia`,
      action: async function (data, msg) {
        try {
          const res = await CONN.login(
            msg.user,
            await context.aux.getEmail(msg.user)
          );
          if (context.aux.checkForResponseError(res, msg, this.name)) return;

          if (res.exists && res.email) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `*You are already signed in with ${res.email}*`,
            });
            return;
          }

          if (res.url) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `${
                res.emailonly
                  ? "You are only signed in via email. Please sign in again via Slack.\n "
                  : ""
              }<${res.url}|Click here> to login with Google :key:`,
            });
          }
        } catch (error) {
          context.aux.postError(msg, this.name, error);
        }
      },
    },

    logout: {
      desc: `Logout of Maia`,
      action: async function (data, msg) {
        web.chat.postMessage({
          channel: msg.channel,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Are you sure you want to logout?*",
              },
            },
            {
              type: "actions",
              block_id: "logout",
              elements: [
                {
                  action_id: JSON.stringify(
                    await context.aux.getEmail(msg.user)
                  ),
                  type: "button",
                  style: "danger",
                  text: {
                    type: "plain_text",
                    text: "Logout",
                  },
                },
              ],
            },
          ],
        });
      },
    },

    constraint: {
      desc: `Modify your working hours`,
      action: async function (data, msg) {
        try {
          if (
            !data.busyTimes ||
            !data.busyTimes.length ||
            !data.busyDays.filter((d) => parseInt(d)).length
          ) {
            web.chat.postMessage({
              channel: msg.channel,
              blocks: BLOCKS.constraints,
            });
            return;
          }
          const res = await CONN.constraints(
            await context.aux.getEmail(msg.user),
            data.busyDays,
            data.busyTimes
          );
          if (context.aux.checkForResponseError(res, msg, this.name)) return;

          if (res.success) {
            await web.chat.postMessage({
              channel: msg.channel,
              text: `Okay, cool! :thumbsup::skin-tone-4: I'll keep this in mind. :brain:`,
            });
          }
        } catch (error) {
          context.aux.postError(msg, this.name, error);
        }
      },
    },

    schedule: {
      desc: `Schedule a meeting`,
      action: async function (data, msg) {
        try {
          const ids = [
            msg.user,
            ...data.people.map((mention) =>
              UTILS.slack.getId(mention.split(" ").join("").toUpperCase())
            ),
          ];
          const slackEmails = await Promise.all(ids.map(context.aux.getEmail));

          const res = await CONN.schedule(
            slackEmails,
            data.title,
            data.duration,
            data.startDateRange,
            data.endDateRange,
            data.startTimeRange,
            data.endTimeRange,
            data.flexible,
            data.dayOfWeek,
            data.timeRangeSpecified
          );
          if (context.aux.checkForResponseError(res, msg, this.name)) return;

          if (res.info) {
            context.aux.postWarn(msg, this.name, res.info);
            return;
          }

          if (res.start) {
            web.chat.postMessage({
              channel: msg.channel,
              text: UTILS.message.generate.schedule(
                res.start,
                res.end,
                data.title
              ),
            });
          }

          context.aux.postConfirm(res, msg, data);
        } catch (error) {
          context.aux.postError(msg, this.name, error);
        }
      },
    },

    reschedule: {
      desc: `Reschedule a meeting`,
      action: async function (data, msg) {
        try {
          // Organiser email (associated with their Google account)
          const email = await context.aux.getEmail(msg.user);

          const res = await CONN.reschedule(
            email,
            data.oldTitle,
            data.oldDateTime,
            data.newStartDateRange,
            data.newEndDateRange,
            data.newStartTimeRange,
            data.newEndTimeRange,
            data.newDayOfWeek,
            data.dateRangeSpecified,
            data.timeRangeSpecified,
            data.flexible
          );
          if (context.aux.checkForResponseError(res, msg, this.name)) return;

          if (res.info) {
            context.aux.postWarn(msg, this.name, res.info);
            return;
          }

          if (res.start) {
            web.chat.postMessage({
              channel: msg.channel,
              text: UTILS.message.generate.reschedule(
                data.oldDateTime,
                res.start,
                data.oldTitle
              ),
            });
          }
          context.aux.postConfirm(res, msg, data);
        } catch (error) {
          context.aux.postError(msg, this.name, error);
        }
      },
    },

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

          const res = await CONN.cancel(email, meetingTitle, meetingDateTime);
          if (context.aux.checkForResponseError(res, msg, this.name)) return;

          if (res.title && res.dateTime) {
            web.chat.postMessage({
              channel: msg.channel,
              text: UTILS.message.generate.cancel(res.title, res.dateTime),
            });
          }
        } catch (error) {
          context.aux.postError(msg, this.name, error);
        }
      },
    },

    recalibrate: {
      desc: `Recalibrate my preferences`,
      action: async function (data, msg) {
        try {
          const res = await CONN.generatePreferences(
            await context.aux.getEmail(msg.user)
          );
          if (context.aux.checkForResponseError(res, msg, this.name)) return;

          if (res.success) {
            await web.chat.postMessage({
              channel: msg.channel,
              text: `Your historical time preferences are being recalculated, this will only take a couple minutes`,
            });
          }
        } catch (error) {
          context.aux.postError(msg, this.name, error);
        }
      },
    },

    setMinBreak: {
      desc: `Set your break length`,
      action: async function (data, msg) {
        try {
          const res = await CONN.setMinBreak(
            await context.aux.getEmail(msg.user),
            data.minBreakLength
          );
          if (context.aux.checkForResponseError(res, msg, this.name)) return;

          if (res.success) {
            await web.chat.postMessage({
              channel: msg.channel,
              text: `Your break has been set to ${data.minBreakLength.toString()} minutes :clock2:`,
            });
          }
        } catch (error) {
          context.aux.postError(msg, this.name, error);
        }
      },
    },
  };

  Object.keys(this.commands).map(function (key) {
    context.commands[key].name = key;
  });

  return this.commands;
};
