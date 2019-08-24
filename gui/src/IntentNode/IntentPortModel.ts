import * as _ from "lodash";
import { LinkModel, DiagramEngine, PortModel, DefaultLinkModel } from "storm-react-diagrams";

export class IntentPortModel extends PortModel {
	position: string | "in" | "out";

	constructor(pos: string = "in") {
		super(pos, "intent");
		this.position = pos;
	}

	serialize() {
		return _.merge(super.serialize(), {
			position: this.position
		});
	}

	deSerialize(data: any, engine: DiagramEngine) {
		super.deSerialize(data, engine);
		this.position = data.position;
	}

	createLinkModel(): LinkModel {
		var m = new DefaultLinkModel();
		m.setColor("green");
		// m.addLabel("Testings");
		return m;
	}
}
