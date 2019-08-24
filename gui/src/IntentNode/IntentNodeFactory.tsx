import * as SRD from "storm-react-diagrams";
import { IntentNodeWidget } from "./IntentNodeWidget";
import { IntentNodeModel } from "./IntentNodeModel";
import * as React from "react";

export class IntentNodeFactory extends SRD.AbstractNodeFactory {
	constructor() {
		super("intent");
	}

	generateReactWidget(diagramEngine: SRD.DiagramEngine, node: IntentNodeModel): JSX.Element {
		return <IntentNodeWidget key={"widget" + node.id} node={node} />;
	}

	getNewInstance() {
		return new IntentNodeModel("UniqueName");
	}
}
