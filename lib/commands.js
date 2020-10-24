const Connection = require('./connection.js');
const UTILS = require('./utils.js');

module.exports = function (CONFIG, web) {

  let context = this;

  // Connection Interface
  this.conn = new Connection(CONFIG.serverURL);

  this.commands = {
    help: {
      desc: `${CONFIG.prefix} help`,
      regex: new RegExp(`${CONFIG.prefix} help`, 'i'),
      action: function (msg) {
        web.chat.postMessage({
          channel: msg.channel,
          text: `> *Help*\n> \`\`\`${Object.keys(context.commands).map(key => `- ${context.commands[key].desc}`).join("\n")}\`\`\``
        });
      }
    },
    login: {
      private: true,
      desc: `${CONFIG.prefix} login`,
      regex: new RegExp(`${CONFIG.prefix} login`, 'i'),
      action: function (msg) {
        context.conn.login(msg.user, msg.team).then(function (res) {
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
              text: `> *LOGIN ERROR: ${error}*`
            });
            return;
          }
          if (!res.url || !res.exists) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *LOGIN ERROR: No url or exists properities found*`
            });
            return;
          }

          if (res.url) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *Click <${res.url}|here> to login with Google*`
            });
          } else {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *You are already signed in*`
            });
          }
        }).catch(function (err) {
          web.chat.postMessage({
            channel: msg.channel,
            text: `> *LOGIN ERROR: ${err}*`
          });
        });
      }
    },
    freeslots: {
      private: true,
      desc: `${CONFIG.prefix} free slots <start_date> <end_date>`,
      regex: new RegExp(`${CONFIG.prefix} free slots ([^\\s]+) ([^\\s]+)`, 'i'),
      action: function (msg, match) {
        if (!match[1] || !match[2]) {
          web.chat.postMessage({
            channel: msg.channel,
            text: `> *FREE SLOTS ERROR: Please enter a time period*`
          });
          return;
        }
        if (new Date(match[1].trim()) == "Invalid Date" || new Date(match[2].trim()) == "Invalid Date") {
          web.chat.postMessage({
            channel: msg.channel,
            text: `> *FREE SLOTS ERROR: Please enter a valid time period*`
          });
          return;
        }
        context.conn.freeslots(msg.user, msg.team, match[1], match[2]).then(function (res) {
          if (!res) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *FREE SLOTS ERROR: Invalid object response*`
            });
            return;
          }
          if (res.error) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *FREE SLOTS ERROR: ${error}*`
            });
            return;
          }

          web.chat.postMessage({
            channel: msg.channel,
            text: `> ${JSON.stringify(res)}`
          });
        }).catch(function (err) {
          web.chat.postMessage({
            channel: msg.channel,
            text: `> *FREE SLOTS ERROR: ${err}*`
          });
        });
      }
    },
    meeting: {
      private: true,
      desc: `${CONFIG.prefix} meeting <mentions...>`,
      search: function(str) {
        str = str.replace(/\s/g, " ");
        let parts = str.split(`${CONFIG.prefix} meeting`);
        if (parts[0] == str) return null;
        let args = parts[1].split(" ").filter(p => p);
        if (!UTILS.allTrue(args.map(UTILS.isMentionId))) return null;
        return [str, ...args.map(UTILS.getMentionId)];
      },
      action: function (msg, match) {
        let userIDs = new Set();
        userIDs.add(msg.user);
        match.slice(1).forEach(function(id) {
          userIDs.add(id);
        });
        context.conn.meeting([...userIDs], msg.team).then(function (res) {
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
              text: `> *MEETING ERROR: ${error}*`
            });
            return;
          }

          web.chat.postMessage({
            channel: msg.channel,
            text: `> ${JSON.stringify(res)}`
          });
        }).catch(function (err) {
          web.chat.postMessage({
            channel: msg.channel,
            text: `> *MEETING ERROR: ${err}*`
          });
        });
      }
    },
  };

  return this.commands;
};