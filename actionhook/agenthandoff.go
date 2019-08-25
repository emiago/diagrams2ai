package actionhook

import (
	"diagrams2ai/rasa"

	log "github.com/sirupsen/logrus"
)

func AgentHandoff(m rasa.CustomAction) (r rasa.CustomActionResponse) {
	log.Println("Running agent handoff")
	r = rasa.CustomActionResponse{
		Events: []rasa.IEvent{
			rasa.NewEventPause(),
			// rasa.NewEventFollowUp("action_default_fallback"),
		},

		Responses: []rasa.Response{
			rasa.Response{Text: "Stopping Bot Conversation"},
			rasa.Response{Text: "To Connect Agent please use following link"},
			rasa.Response{Text: "http://localhost:5000"},
		},
	}
	return
}
