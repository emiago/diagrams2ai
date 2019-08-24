package config

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

var (
	Conf   *Config
	Save   *SaveConfig   //Just for faster access
	Logger *LoggerConfig //Just for faster access
)

type SaveConfig struct {
	RootDir string
}

type LoggerConfig struct {
	RootDir string
}

type Config struct {
	Save   *SaveConfig   `json:"save"`
	Logger *LoggerConfig `json:"logger"`
	//Add other Conf
}

func (c *SaveConfig) GetDiagramDir() string {
	return fmt.Sprintf("%s/%s", c.RootDir, "diagrams")
}

func (c *SaveConfig) GetRasaDir() string {
	return fmt.Sprintf("%s/%s", c.RootDir, "rasa")
}

//Create default configuration
func init() {
	Save = &SaveConfig{
		RootDir: "save",
	}

	Logger = &LoggerConfig{
		RootDir: "", //StdOut by default
	}

	Conf = &Config{
		Save:   Save,
		Logger: Logger,
	}
}

func InitConfig(location string) error {
	content, err := ioutil.ReadFile(location)
	if err != nil {
		return err
	}

	return json.Unmarshal(content, Conf)
}
