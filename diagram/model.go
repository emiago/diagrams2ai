package diagram

import (
	"diagrams2ai/storage"
	"encoding/json"
	"fmt"
	"io/ioutil"
	log "github.com/sirupsen/logrus"
	"os"
	"strings"

	"github.com/pkg/errors"
)

const (
	DIAGRAMSDIR string = "save/diagrams"
	SAVEDIR     string = "save"
	RASADIR     string = "save/rasa"
)

type ModelData struct {
	Id       string `json:"id"`
	Name     string `json:"name"`
	HttpPort int    `json:"httpport"`
	HttpUrl  string `json:"httpurl"`
}

type ModelJSON struct {
	ModelData  ModelData       `json:"model"`   //This is our data model
	DiagramRaw json.RawMessage `json:"diagram"` //This is full json required for diagrams to be built
}

type Model struct {
	ModelData  ModelData       `json:"model"`   //This is our data model
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

func ModelsList() (res []ModelData, rerr error) {
	keys := storage.Redis.Keys("diagrams:*").Val()
	res = make([]ModelData, 0, len(keys))
	for _, key := range keys {
		id := strings.Split(key, ":")[1]
		d, err := ModelDataGet(id)
		if err != nil {
			return nil, err
		}
		res = append(res, d)
	}

	return
}

func ModelDataGet(id string) (ModelData, error) {
	d := ModelData{
		Id: id,
	}
	cmd := storage.Redis.Do("HGET", "diagrams:"+id, "name")

	d.Name, _ = cmd.String()

	cmd = storage.Redis.Do("HGET", "diagrams:"+id, "httpport")

	d.HttpPort, _ = cmd.Int()

	cmd = storage.Redis.Do("HGET", "diagrams:"+id, "httpurl")

	d.HttpUrl, _ = cmd.String()

	return d, nil
}

func (current *ModelData) SetHttpPort() error {
	allmodels, err := ModelsList()
	if err != nil {
		return err
	}

	//Find maximum or use current one
	var maxport int = 15000
	for _, m := range allmodels {
		if m.HttpPort > maxport {
			maxport = m.HttpPort
		}
		if current.Id != m.Id && current.HttpPort == m.HttpPort {
			current.HttpPort = 0
		}
	}

	maxport++

	if current.HttpPort == 0 {
		current.HttpPort = maxport
	}

	current.HttpUrl = fmt.Sprintf("http://localhost:%d", current.HttpPort)
	return nil
}

func ModelDataSave(m ModelData) error {
	cmd := storage.Redis.Do("HMSET",
		"diagrams:"+m.Id,
		"name", m.Name,
		"httpport", m.HttpPort,
		"httpurl", m.HttpUrl,
	)
	_, err := cmd.Result()
	if err != nil {
		return err
	}

	return nil
}

func ModelSave(m *Model) error {
	if err := ModelDataSave(m.ModelData); err != nil {
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

func ModelRun(id string) (model ModelData, rerr error) {
	model, rerr = ModelDataGet(id)
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
	ModelDataSave(model)
	return
}
