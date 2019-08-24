package rasa

type Response struct {
	Text string `json:"text"`
}

type CustomAction struct {
	NextAction string  `json:"next_action"`
	Tracker    Tracker `json:"tracker"`
}

type CustomActionResponse struct {
	Events    []Event    `json:"events"`
	Responses []Response `json:"responses"`
}
