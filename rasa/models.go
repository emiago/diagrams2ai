package rasa

type Intent struct {
	Name  string   `json:"name"`
	Type  string   `json:"type"`
	Text  string   `json:"text"`
	Texts []string `json:"texts"`
}

type Button struct {
	Title   string `json:"title"`
	Payload string `json:"payload"`
}

type Action struct {
	Name    string   `json:"name"`
	Type    string   `json:"type"`
	Texts   []string `json:"texts"`
	Buttons []Button `json:"buttons"`
	Text    string   `json:"text"`
}
