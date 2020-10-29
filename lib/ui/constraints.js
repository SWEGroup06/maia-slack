const COMMANDS = require('../commands.js');

const constraints =
	[
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				// TODO: Write better message
				"text": "Hey :wave::skin-tone-3: Choose a day and times you want to add a constraint below"
			}
    },
		{
			"type": "divider"
		},
		{
			"type": "actions",
			"block_id": "constraints",
			"elements": [
				{
					"type": "static_select",
					"placeholder": {
						"type": "plain_text",
						"text": "Select a day"
					},
					"action_id": "day",
					"options": [
						{
							"text": {
								"type": "plain_text",
								"text": "Monday"
							},
							"value": "Monday"
						},
						{
							"text": {
								"type": "plain_text",
								"text": "Tuesday"
							},
							"value": "Tuesday"
						},
						{
							"text": {
								"type": "plain_text",
								"text": "Wednesday"
							},
							"value": "Wednesday"
						},
						{
							"text": {
								"type": "plain_text",
								"text": "Thursday"
							},
							"value": "Thursday"
						},
						{
							"text": {
								"type": "plain_text",
								"text": "Friday"
							},
							"value": "Friday"
						},
						{
							"text": {
								"type": "plain_text",
								"text": "Saturday"
							},
							"value": "Saturday"
						},
						{
							"text": {
								"type": "plain_text",
								"text": "Sunday"
							},
							"value": "Sunday"
						}
					]
				},
				{
					"type": "timepicker",
					"initial_time": "13:37",
					"placeholder": {
						"type": "plain_text",
						"text": "Select time",
						"emoji": true
					},
					"action_id": "startTime"
				},
				{
					"type": "timepicker",
					"initial_time": "13:37",
					"placeholder": {
						"type": "plain_text",
						"text": "Select time",
						"emoji": true
					},
					"action_id": "endTime"
				}
			]
		},
		{
			"type": "actions",
			"block_id": "submit",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Submit",
						"emoji": true
					},
					"value": "click_me_123",
					"action_id": "actionId-0"
				}
			]
		},
		{
			"type": "divider"
		}
  ]


  module.exports = {
	constraints: constraints
};
