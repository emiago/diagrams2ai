package rasa

type IEvent interface {
	GetEvent() string
}

type Event struct {
	Event string `json:"event"`
}

func (e Event) GetEvent() string {
	return e.Event
}

type EventFollowUp struct {
	Event
	Name string `json:"name"`
}

func NewEventFollowUp(name string) EventFollowUp {
	e := EventFollowUp{
		Name: name,
	}
	e.Event.Event = "followup"
	return e
}

func NewEventPause(name string) Event {
	e := Event{Event: "pause"}
	return e
}
