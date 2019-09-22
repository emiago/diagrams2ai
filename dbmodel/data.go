package dbmodel

import (
	"diagrams2ai/rasa"
	"diagrams2ai/storage"
	"encoding/json"
	"fmt"
	"strings"

	log "github.com/sirupsen/logrus"
)

type Actions struct {
	FallbackAction rasa.Action `json:"action_default_fallback"`
}

type Data struct {
	Id       string  `json:"id"`
	Name     string  `json:"name"`
	HttpPort int     `json:"httpport"`
	HttpUrl  string  `json:"httpurl"`
	Actions  Actions `json:"actions"`
}

func AllModels() (res []Data, rerr error) {
	keys := storage.Redis.Keys("diagrams:*").Val()
	res = make([]Data, 0, len(keys))
	for _, key := range keys {
		id := strings.Split(key, ":")[1]
		d, err := Get(id)
		if err != nil {
			return nil, err
		}
		res = append(res, d)
	}

	return
}

func Get(id string) (Data, error) {
	d := Data{
		Id: id,
	}
	cmd := storage.Redis.Do("HGET", "diagrams:"+id, "name")

	d.Name, _ = cmd.String()

	cmd = storage.Redis.Do("HGET", "diagrams:"+id, "httpport")

	d.HttpPort, _ = cmd.Int()

	cmd = storage.Redis.Do("HGET", "diagrams:"+id, "httpurl")

	d.HttpUrl, _ = cmd.String()

	cmd = storage.Redis.Do("GET", "actions:"+id)

	jActions, _ := cmd.String()
	if jActions != "" {
		if err := json.Unmarshal([]byte(jActions), &d.Actions); err != nil {
			return d, err
		}
	}

	return d, nil
}

func Delete(id string) error {
	cmd := storage.Redis.Del("diagrams:" + id)
	return cmd.Err()
}

func (current *Data) SetHttpPort() error {
	allmodels, err := AllModels()
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

func (m *Data) Save() error {
	log.Println("Saving model to redis", m.Id)
	jActions, _ := json.Marshal(m.Actions)
	cmd := storage.Redis.Do("HMSET",
		"diagrams:"+m.Id,
		"name", m.Name,
		"httpport", m.HttpPort,
		"httpurl", m.HttpUrl,
	)

	if err := cmd.Err(); err != nil {
		return err
	}

	cmd = storage.Redis.Do("SET", "actions:"+m.Id, jActions)

	if err := cmd.Err(); err != nil {
		return err
	}

	return nil
}
