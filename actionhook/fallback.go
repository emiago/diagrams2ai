package actionhook

import (
	"diagrams2ai/dbmodel"
	"diagrams2ai/rasa"

	log "github.com/sirupsen/logrus"
)

func ActionFallback(m CustomAction) (r rasa.CustomActionResponse) {
	log.Println("Running fallback action for", m.ModelId)
	model, _ := dbmodel.Get(m.ModelId)

	r = rasa.CustomActionResponse{
		Events: []rasa.IEvent{
			rasa.NewEventRevind(),
		},

		Responses: []rasa.Response{},
	}

	faction := model.Actions.FallbackAction
	for _, t := range faction.Texts {
		r.Responses = append(r.Responses, rasa.Response{Text: t})
	}
	return
}
