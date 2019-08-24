package diagram

import (
	"fmt"
	"io/ioutil"
	"log"
	"strings"
)

func parseDiagramToRasa(m Diagram) string {
	var nlu string = ""

	for _, n := range m.Nodes {
		nlu += fmt.Sprintf("## intent:%s\n", n.Intent.Name)

		for _, isen := range n.Intent.Texts {
			nlu += fmt.Sprintf("- %s\n", isen)
		}

		nlu += "\n"
	}

	nlu = strings.TrimSuffix(nlu, "\n")

	var domain string = ""

	//Intents list
	domain += "intents:\n"

	for _, n := range m.Nodes {
		domain += fmt.Sprintf("- %s\n", n.Intent.Name)
	}

	//Action list
	domain += "\nactions:\n"

	for _, n := range m.Nodes {
		for _, a := range n.Actions {
			if a.Type == "utter" || a.Type == "utter_buttons" {
				domain += fmt.Sprintf("- utter_%s\n", a.Name)
			}
		}
	}

	//Template list
	domain += "\ntemplates:\n"

	for _, n := range m.Nodes {
		for _, a := range n.Actions {
			domain += fmt.Sprintf("  utter_%s:\n", a.Name)
			if a.Type == "utter" {
				for _, osen := range a.Texts {
					domain += fmt.Sprintf("  - text: \"%s\"\n", osen)
				}
				domain += "\n"
			} else if a.Type == "utter_buttons" {
				domain += fmt.Sprintf("  - text: \"%s\"\n", a.Text)
				domain += fmt.Sprintf("    buttons:\n")
				for _, b := range a.Buttons {
					domain += fmt.Sprintf("    - title: \"%s\"\n", b.Title)
					domain += fmt.Sprintf("      payload: \"%s\"\n", b.Payload)
				}
				domain += "\n"
			}
		}
	}

	domain = strings.TrimSuffix(domain, "\n")

	// var stories string = ""
	var startingNodes []Node

	for _, n := range m.Nodes {
		inport := n.GetInPort()
		outport := n.GetOutPort()
		if len(inport.Links) == 0 && len(outport.Links) > 0 {
			//This is starting point of story
			startingNodes = append(startingNodes, n)
		}
	}

	sp := NewStoryParser(m)

	for _, n := range startingNodes {
		// inport := n.GetInPort()
		log.Println("Starting story", n.Intent.Name)
		sp.loopStories(n)
	}

	// debugstory, _ := json.Marshal(sp.stories)
	var stories string
	for k, nodes := range sp.stories {
		if len(nodes) == 0 {
			continue
		}

		stories += fmt.Sprintf("## story_%s_%d\n", nodes[0].Name, k)
		for _, n := range nodes {
			stories += fmt.Sprintf("* %s\n", n.Intent.Name)
			for _, a := range n.Actions {
				if a.Type == "utter" || a.Type == "utter_buttons" {
					stories += fmt.Sprintf("  - utter_%s\n", a.Name)
					continue
				}

				stories += fmt.Sprintf("  - %s\n", a.Type)
			}
		}
		stories += "\n"
	}

	stories = strings.TrimSuffix(stories, "\n")

	// log.Printf("domain.yml\n%s", domain)
	// log.Println("")

	// log.Printf("nlu.md\n%s", nlu)
	// log.Println("")

	// log.Printf("stories %d\n%s", len(sp.stories), stories)
	modeldir := RasaGetModelDir(m.Id)
	RasaInitModel(modeldir)

	if err := ioutil.WriteFile(modeldir+"/data/nlu.md", []byte(nlu), 0644); err != nil {
		log.Println(err)
	}

	if err := ioutil.WriteFile(modeldir+"/data/stories.md", []byte(stories), 0644); err != nil {
		log.Println(err)
	}

	if err := ioutil.WriteFile(modeldir+"/domain.yml", []byte(domain), 0644); err != nil {
		log.Println(err)
	}

	// RasaTrainModel(modeldir)
	log.Println("Configuration completed", modeldir)
	return modeldir
}
