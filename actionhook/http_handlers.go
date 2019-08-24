package actionhook

import (
	"diagrams2ai/rasa"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
)

type SimpleResponse struct {
	Content string
}

func respondJSON(w http.ResponseWriter, response interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func ActionHookHandler(w http.ResponseWriter, r *http.Request) {
	//POST method, receives a json to parse
	log.Println("Action hook fired")

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body",
			http.StatusInternalServerError)
		return
	}

	var m rasa.CustomAction
	err = json.Unmarshal(body, &m)
	if err != nil {
		http.Error(w, "Failed to parse model",
			http.StatusInternalServerError)
		return
	}

	log.Printf("%+v\n", m)
	//Here we should somehow have this in database, and run differen things

	var res rasa.CustomActionResponse = RasaActionTextResponse("Unknown custom action")
	switch m.NextAction {
	case "action_asterisk_call":
		res = AsteriskDialChannel(m)
	case "action_connect_agent":
		res = AsteriskDialChannel(m)
	}

	// RasaParseAndSave(m, body)

	// Use NLP
	respondJSON(w, res)
}

func RasaActionTextResponse(s string) rasa.CustomActionResponse {
	return rasa.CustomActionResponse{
		Events: []rasa.Event{
			// rasa.Event{Event: "text"},
		},

		Responses: []rasa.Response{
			rasa.Response{Text: s},
		},
	}
}

func ActionConnectAgent(m rasa.CustomAction) (r rasa.CustomActionResponse) {
	log.Println("Dialing asterisk channel")
	r = rasa.CustomActionResponse{
		Events: []rasa.Event{
			// rasa.Event{Event: "text"},
		},

		Responses: []rasa.Response{
			rasa.Response{Text: "I can not understand. I will connect you to live agent..."},
			rasa.Response{Text: "Please use following link"},
			rasa.Response{Text: "http://localhost:3001?hubid=test"},
		},
	}
	return
}
