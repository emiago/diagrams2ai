package diagram

type StoryParser struct {
	nodesmap map[string]Node
	linksmap map[string]Link

	stories [][]Node
}

func createNodesIdMap(nodes []Node) map[string]Node {
	m := make(map[string]Node, len(nodes))

	for _, n := range nodes {
		m[n.Id] = n
	}

	return m
}

func createLinksIdMap(nodes []Link) map[string]Link {
	m := make(map[string]Link, len(nodes))

	for _, n := range nodes {
		m[n.Id] = n
	}

	return m
}

func NewStoryParser(m Diagram) *StoryParser {
	s := &StoryParser{}
	//Stories
	s.nodesmap = createNodesIdMap(m.Nodes)
	s.linksmap = createLinksIdMap(m.Links)
	s.stories = make([][]Node, 0)
	return s
}

func (s *StoryParser) loopStories(n Node) {
	var path []Node = make([]Node, 0)

	s.addNewPath(path, n)
}

func (s *StoryParser) addNewPath(path []Node, n Node) {
	// log.Printf("Adding new path %p Node %p %s\n", &path, &n, n.Name)
	path = s.updatePath(path, n) //Add all node links to this path

	// log.Printf("Adding to story %p Nodes %d\n", &path, len(path))
	s.stories = append(s.stories, path) //Add this path as new story
}

func (s *StoryParser) updatePath(path []Node, n Node) []Node {
	// log.Printf("updatePath %p Node %p %s\n", &path, &n, n.Name)
	path = append(path, n)
	outport := n.GetOutPort()

	inpath := path
	for k, l := range outport.Links {
		link := s.linksmap[l]
		targetNode := s.nodesmap[link.Target]
		//Now multiple paths can occure, we need to duplicate story for each
		if k > 0 {
			newpath := append(path[:0:0], inpath...) //Copy all path
			s.addNewPath(newpath, targetNode)
			continue
		}
		path = s.updatePath(path, targetNode)
	}

	return path
}
