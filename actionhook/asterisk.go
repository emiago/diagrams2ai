package actionhook

import (
	"diagrams2ai/rasa"

	log "github.com/sirupsen/logrus"
)

func AsteriskDialChannel(m rasa.CustomAction) (r rasa.CustomActionResponse) {
	log.Println("Dialing asterisk channel")
	r = rasa.CustomActionResponse{
		Events: []rasa.Event{
			// rasa.Event{Event: "text"},
		},

		Responses: []rasa.Response{
			rasa.Response{Text: "Calling Asterisk is successful"},
		},
	}
	return
}
