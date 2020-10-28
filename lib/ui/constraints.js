const constraints =
	[
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Hello, Maia Calendar here. Please input your time constraints:"
			}
    },
		{
			"type": "divider"
		},
		{
			"type": "actions",
			"block_id": "actions1",
			"elements": [
				{
					"type": "static_select",
					"placeholder": {
						"type": "plain_text",
						"text": "Select a day"
					},
					"action_id": "select_2",
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
					"action_id": "actionId-0"
				},
				{
					"type": "timepicker",
					"initial_time": "13:37",
					"placeholder": {
						"type": "plain_text",
						"text": "Select time",
						"emoji": true
					},
					"action_id": "actionId-1"
				}
			]
		},
		{
			"type": "actions",
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
