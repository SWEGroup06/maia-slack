const Connection = require('./connection.js');

module.exports = function (CONFIG, web) {

  let context = this;

  // Connection Interface
  this.conn = new Connection(CONFIG.serverURL);

  this.commands = {
    help: {
      desc: `${CONFIG.prefix} help`,
      regex: new RegExp(`${CONFIG.prefix} help`, 'g'),
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
      regex: new RegExp(`${CONFIG.prefix} login`, 'g'),
      action: function (msg) {
        context.conn.login(msg.user).then(function (res) {
          if (!res || !res.url) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *LOGIN ERROR: Invalid Object Response*`
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
      desc: `${CONFIG.prefix} free slots`,
      regex: new RegExp(`${CONFIG.prefix} free slots`, 'g'),
      action: function (msg) {
        context.conn.freeslots(msg.user).then(function (res) {
          if (!res) {
            web.chat.postMessage({
              channel: msg.channel,
              text: `> *FREE SLOTS ERROR: Invalid Object Response*`
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
            text: `> *<FREE SLOTS>*`
          });
        }).catch(function (err) {
          web.chat.postMessage({
            channel: msg.channel,
            text: `> *FREE SLOTS ERROR: ${err}*`
          });
        });
      }
    }
  };

  return this.commands;
};