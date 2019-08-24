import * as React from "react";
import { IntentNodeModel } from "./IntentNodeModel";
import { PortWidget } from "storm-react-diagrams";
import './Intent.css';
import { Header, Segment, List } from 'semantic-ui-react'
// import { notDeepEqual } from "assert";

// let idcounter = 1;

export interface IntentNodeWidgetProps {
	node: IntentNodeModel;
	size: number;
	width: number;
	height: number;
}

export interface IntentNodeWidgetState {
	id: string,
	// title: string,
	// inputsentences: string[],
	// outputsentences: string[],
}

/**
 * @author Dylan Vorster
 */
export class IntentNodeWidget extends React.Component<IntentNodeWidgetProps, IntentNodeWidgetState> {
	public static defaultProps: IntentNodeWidgetProps = {
		size: 150,
		node: new IntentNodeModel("UniqueName"),
		width: 300,
		height: 170,
	};

	constructor(props: IntentNodeWidgetProps) {
		super(props);
		var node = this.props.node;
		this.state = {
			id: "nodew" + node.id,
			// title: node.title,
			// inputsentences: node.inputsentences || [],
			// outputsentences: node.outputsentences || [],
		};
		// this.props.size = 150;
	}

	render() {
		// console.log("rendering node", this.props.node);
		const { node } = this.props
		var activeClass = node.active ? " active" : "";

		return (
			<div
				className={"intent-node" + activeClass}
				style={{
					position: "relative",
					width: this.props.width,
					height: this.props.height
				}}
			>

				<div
					style={{
						position: "absolute",
						zIndex: 10,
						top: 0 - 17,
						left: this.props.width / 2 - 8,
						background: "silver",
					}}
				>
					<PortWidget name="in" node={this.props.node} />
				</div>

				<div
					style={{
						position: "absolute",
						zIndex: 10,
						top: this.props.height - 2,
						left: this.props.width / 2 - 8,
						background: "silver",
					}}
				>
					<PortWidget name="out" node={this.props.node} />
				</div>

				<div className='intent-grid'>
					<Segment vertical textAlign='center' className='intent-header'><Header size='tiny'>{node.name}</Header></Segment>
					<Segment vertical textAlign='left'>
						<div className='intent-label'>Intents:</div>
						<List className='intent-list'>
							{node.intent.texts.map((text, index) => {
								return <List.Item key={"insen" + node.id + index}>{text}</List.Item>
							})}
						</List>
					</Segment>
					<Segment vertical textAlign='left'>
						<div className='intent-label'>Actions:</div>
						<List className='intent-list'>
							{node.actions.map((action, ni) => {
								if (action.type === "utter") {
									return action.texts.map((text, index) => {
										return <List.Item key={"outsen" + node.id + ni + "" + index}>{text}</List.Item>
									});
								}
							})}
						</List>
					</Segment>
				</div>
			</div>
		);
	}
}
