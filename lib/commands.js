const Connection = require('./connection.js');

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
        context.conn.login(`${msg.team}|${msg.user}`).then(function (res) {
          if (!res || !res.url) {
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

          web.chat.postMessage({
            channel: msg.channel,
            text: `> *Click <${res.url}|here> to login with Google*`
          });
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
      regex: new RegExp(`${CONFIG.prefix} free slots ([^\s]+) ([^\s]+)`, 'i'),
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
        context.conn.freeslots(msg.user, match[1], match[2]).then(function (res) {
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
      regex: new RegExp(`${CONFIG.prefix} free slots ([^\s]+) ([^\s]+)`, 'i'),
      action: function (msg, match) {

      }
    },
  };

  return this.commands;
};