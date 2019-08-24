package diagram

import (
	"encoding/json"
	"io/ioutil"
	log "github.com/sirupsen/logrus"
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

func ModelsListHandler(w http.ResponseWriter, r *http.Request) {
	models, err := ModelsList()

	if err != nil {
		log.Println("Loading models list failed", err)
		http.Error(w, "Failed to load models",
			http.StatusInternalServerError)
		return
	}

	respondJSON(w, models)
}

func ModelSaveHandler(w http.ResponseWriter, r *http.Request) {
	//POST method, receives a json to parse
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body",
			http.StatusInternalServerError)
		return
	}

	log.Println("Saving model")
	m := Model{}
	if err := json.Unmarshal(body, &m); err != nil {
		log.Println(err, m.Id())
		http.Error(w, "Failed to parse model", http.StatusInternalServerError)
		return
	}

	// log.Println(m)

	if err := ModelSave(&m); err != nil {
		log.Println(err, m.Id())
		http.Error(w, "Failed to save model", http.StatusInternalServerError)
		return
	}
	// Use NLP
	respondJSON(w, SimpleResponse{"Model Saved"})
}

func ModelLoadHandler(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}

	m := struct {
		Id string `json:"id"`
	}{}

	err = json.Unmarshal(body, &m)
	if err != nil {
		http.Error(w, "Failed to parse id", http.StatusBadRequest)
		return
	}

	content, err := ioutil.ReadFile(GetDiagramFile(m.Id))
	if err != nil {
		log.Println(err)
		http.Error(w, "Failed to open model "+m.Id, http.StatusBadRequest)
		return
	}

	data, _ := ModelDataGet(m.Id)

	raw := json.RawMessage(content)
	model := Model{
		ModelData:  data,
		DiagramRaw: raw,
	}

	content, err = json.Marshal(model)
	if err != nil {
		log.Println(err)
		http.Error(w, "Failed to parse model output "+m.Id, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(content)
}

func ModelTrainHandler(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}

	m := struct {
		Id string `json:"id"`
	}{}

	err = json.Unmarshal(body, &m)
	if err != nil {
		http.Error(w, "Failed to parse id", http.StatusBadRequest)
		return
	}

	if err := ModelTrain(m.Id); err != nil {
		http.Error(w, "Failed to train model", http.StatusInternalServerError)
		return
	}

	respondJSON(w, SimpleResponse{"Model trained"})
}

func ModelRunHandler(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}

	m := struct {
		Id string `json:"id"`
	}{}

	err = json.Unmarshal(body, &m)
	if err != nil {
		http.Error(w, "Failed to parse id",
			http.StatusBadRequest)
		return
	}

	model, err := ModelRun(m.Id)
	if err != nil {
		log.Println("Failed to get model", m.Id, err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	respondJSON(w, model)
}
