const SlackClient = require("@slack/client");
const { RTMClient, WebClient } = SlackClient;

// Load environment variables
require("dotenv").config();

const CONFIG = require("./config.js");

// Slack Interfaces
const rtm = new RTMClient(CONFIG.BOT_TOKEN);
const web = new WebClient(CONFIG.BOT_TOKEN);

const CONN = require("./lib/connection.js");

const COMMANDS = require("./lib/commands.js")(CONFIG, web, CONN);

// Start callback
rtm.on("ready", function () {
  console.log("============================");
  console.log(`Maia ${CONFIG.DEBUG ? "(BETA)" : ""} is ONLINE`);
  console.log(`Server URL: ${CONFIG.serverURL}`);
  console.log("============================");
});

// Message Event callback
const msgEventHandlers = {
  message: async function (msg) {
    let content = msg.text;

    // Discard if no message content or messages without prefix
    if (!content || !content.toLowerCase().startsWith(CONFIG.prefix)) return;
    content = content.toLowerCase().split("maia")[1].trim();

    const loading = await web.chat.postMessage({
      channel: msg.channel,
      text: "Loading...",
    });
    try {
      const res = await CONN.nlp(content);
      if (res.type !== "unknown") {
        const cmd = COMMANDS[res.type];
        if (cmd && cmd.action) await cmd.action(res, msg);
      } else {
        web.chat.postMessage({
          channel: msg.channel,
          text: res.msg || "Invalid Command",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      web.chat.delete({
        token: CONFIG.BOT_TOKEN,
        channel: msg.channel,
        ts: loading.message.ts,
      });
    }
  },
};

rtm.on("message", async function (data) {
  const handler = msgEventHandlers[data.type];
  if (handler) {
    await handler(data);
  }
});

rtm.start();
