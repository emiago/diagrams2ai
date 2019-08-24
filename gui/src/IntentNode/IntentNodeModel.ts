import * as _ from "lodash";
import { NodeModel, DiagramEngine } from "storm-react-diagrams";
import { IntentPortModel } from "./IntentPortModel";
import { RasaIntent, RasaAction } from "../Rasa/Models";

// export interface DiamonNodeModelProps {
// 	title: string;
// 	inputsentences: string[];
// 	outputsentence: string[];
// }

export class IntentNodeModel extends NodeModel {
	// public static defaultProps: DiamonNodeModelProps = {
	// 	title: "Add title",
	// 	inputsentences: [],
	// 	outputsentence: [],
	// };
	name: string;
	intent: RasaIntent;
	actions: RasaAction[];
	active: boolean;

	constructor(name: string) {
		super("intent");
		this.name = name;
		this.intent = new RasaIntent("text", this.name);
		this.actions = [];
		this.active = false;

		// this.addPort(new IntentPortModel("top"));
		this.addPort(new IntentPortModel("in"));
		// this.addPort(new IntentPortModel("bottom"));
		this.addPort(new IntentPortModel("out"));

		// this.addPort(new DefaultPortModel(true, "in", "In"));
		// this.addPort(new DefaultPortModel(false, "out", "Out"));
		// this.addInPort("In");
		// this.addOutPort("out");
	}

	serialize() {
		return _.merge(super.serialize(), {
			name: this.name,
			intent: this.intent,
			actions: this.actions,
		});
	}

	deSerialize(data: any, engine: DiagramEngine) {
		super.deSerialize(data, engine);
		this.name = data.name;
		this.intent = data.intent;
		this.actions = data.actions;
	}

	setIntentTexts(texts: string[]) {
		this.intent.texts = texts;
	}

	setActionTexts(texts: string[]) {
		var arr = [];
		var i = new RasaAction("utter", this.name);
		i.texts = texts;
		arr.push(i);
		this.actions = arr;
	}

}

export class IntentFallbackNodeModel extends IntentNodeModel {
	constructor() {
		super("default");
		this.intent.type = "fallback";
		// this.name = "default";
	}
}
