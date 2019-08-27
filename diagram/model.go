package diagram

import (
	"diagrams2ai/dbmodel"
	"encoding/json"
	"io/ioutil"
	"os"

	log "github.com/sirupsen/logrus"

	"github.com/pkg/errors"
)

const (
	DIAGRAMSDIR string = "save/diagrams"
	SAVEDIR     string = "save"
	RASADIR     string = "save/rasa"
)

type ModelJSON struct {
	ModelData  dbmodel.Data    `json:"model"`   //This is our data model
	DiagramRaw json.RawMessage `json:"diagram"` //This is full json required for diagrams to be built
}

type Model struct {
	ModelData  dbmodel.Data    `json:"model"`   //This is our data model
	DiagramRaw json.RawMessage `json:"diagram"` //This is full json required for diagrams to be built
	Diagram    Diagram         `json:"-"`       //This is light version of diagram, needed just for parsing nodes and links
}

func (m *Model) MarshalJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *Model) UnmarshalJSON(b []byte) error {
	var mj = ModelJSON{}
	if err := json.Unmarshal(b, &mj); err != nil {
		return err
	}

	m.ModelData = mj.ModelData
	m.DiagramRaw = mj.DiagramRaw

	if err := json.Unmarshal(mj.DiagramRaw, &m.Diagram); err != nil {
		return err
	}
	return nil
}

func (m *Model) Id() string {
	return m.ModelData.Id
}

func ModelDataSave(m *dbmodel.Data) error {
	return m.Save()
}

func ModelSave(m *Model) error {
	if err := ModelDataSave(&m.ModelData); err != nil {
		return errors.Wrap(err, "Failed save model into redis")
	}

	//Lets save our diagram json into file
	if _, err := os.Stat(DIAGRAMSDIR); os.IsNotExist(err) {
		if err := os.MkdirAll(DIAGRAMSDIR, 0777); err != nil {
			log.Println(err)
		}
	}

	if err := ioutil.WriteFile(GetDiagramFile(m.Diagram.Id), m.DiagramRaw, 0644); err != nil {
		return errors.Wrap(err, "Failed save model into file")
	}

	parseDiagramToRasa(m.Diagram)
	return nil
}

func ModelTrain(id string) error {
	modeldir := RasaGetModelDir(id)
	if err := RasaTrainModel(id, modeldir); err != nil {
		return err
	}
	return nil
}

func ModelRun(id string) (model dbmodel.Data, rerr error) {
	model, rerr = dbmodel.Get(id)
	if rerr != nil {
		log.Println("Failed to get model", id, rerr)
		return
	}

	modeldir := RasaGetModelDir(id)
	if rerr = model.SetHttpPort(); rerr != nil {
		return
	}

	if rerr = RasaRunModel(&model, modeldir); rerr != nil {
		return
	}

	//resave to db with updated params
	ModelDataSave(&model)
	return
}
