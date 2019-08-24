package diagram

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

type Node struct {
	Id      string   `json:"id"`
	Name    string   `json:"name"`
	Intent  Intent   `json:"intent"`
	Actions []Action `json:"actions"`
	Ports   []Port   `json:"ports"`
}

func (n Node) GetInPort() Port {
	//Mostly it will be first
	p := n.Ports[0]
	if p.Name == "out" {
		p = n.Ports[1]
	}
	return p
}

func (n Node) GetOutPort() Port {
	p := n.Ports[1]
	if p.Name == "in" {
		p = n.Ports[0]
	}
	return p
}

type Link struct {
	Id         string `json:"id"`
	Source     string `json:"source"`
	SourcePort string `json:"sourcePort"`
	Target     string `json:"target"`
	TargetPort string `json:"targetPort"`
}

type Port struct {
	Id    string   `json:"id"`
	Name  string   `json:"name"`
	Links []string `json:"links"`
}

type Diagram struct {
	Id    string `json:"id"`
	Nodes []Node `json:"nodes"`
	Links []Link `json:"links"`
}
