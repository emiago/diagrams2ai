package config

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

var (
	Conf *Config
	// Save *SaveConf //Just for faster access
)

type SaveConfig struct {
	RootDir string
}

type Config struct {
	Save *SaveConfig `json:"save"`
	//Add other Conf
}

func (c *SaveConfig) GetDiagramDir() string {
	return fmt.Sprintf("%s/%s", c.RootDir, "diagrams")
}

func (c *SaveConfig) GetRasaDir() string {
	return fmt.Sprintf("%s/%s", c.RootDir, "rasa")
}

//Create default configuration
func Init() {
	Conf = &Config{
		Save: &SaveConfig{
			RootDir: "save",
		},
	}
}

func InitConfig(location string) error {
	content, err := ioutil.ReadFile(location)
	if err != nil {
		return err
	}

	return json.Unmarshal(content, Conf)
}
