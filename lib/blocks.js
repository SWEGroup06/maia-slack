module.exports = {
  help: function(COMMANDS) {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Hello! I am Maia your Calendar Assistant. How may I help you? :blush: \n\n*Here\'s what you can ask me to do*',
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        fields: COMMANDS.map((cmd) => {
          return {
            type: 'mrkdwn',
            text: `:small_orange_diamond: ${cmd.desc}`,
          };
        }),
      },
      {
        type: 'divider',
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Ask Maia a question to get started',
          },
        ],
      },
    ];
  },
  constraints: require('../blocks/constraints.json'),
  reschedule: require('../blocks/reschedule.json'),
  confirmation: require('../blocks/confirmation.json'),
};
