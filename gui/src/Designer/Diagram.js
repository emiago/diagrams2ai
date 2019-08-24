import React from 'react';
import { Button, Form, Header } from 'semantic-ui-react';
import {
    // DiagramProps,
    // DefaultNodeModel,
    DefaultLinkModel,
    DiagramEngine,
    DiagramModel,
    // LinkModel,
    DiagramWidget
} from "storm-react-diagrams";
import { ChatWindow } from '../ChatWindow/ChatWindow';
import { UID } from '../Helpers/Helpers';
import { IntentNodeFactory } from "../IntentNode/IntentNodeFactory";
import { IntentFallbackNodeModel, IntentNodeModel } from "../IntentNode/IntentNodeModel";
import { IntentPortModel } from "../IntentNode/IntentPortModel";
import { SimplePortFactory } from "../IntentNode/SimplePortFactory";
import { WidgetsEditor } from './WidgetsEditor';
import queryString from 'query-string';
import "storm-react-diagrams/dist/style.min.css";
import './Designer.css';
// const queryString = require('query-string');

function httpjson(uri, params, method = 'POST') {
    return fetch("http://localhost:5000" + uri, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
    });
}

function ajaxpost(uri, params) {
    return httpjson(uri, params, 'POST').then(res => res.json())
}

function EditorHeader(props) {
    return <Header size="large" className="diagram-editor-header" textAlign="center">{props.children}</Header>
}

export class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        const { engine, model } = this.props;

        this.state = {
            model: {
                id: model.id,
                name: "",
                httpport: 0,
                httpurl: "",
            },
            saving: false,
            saved: false,
            modelsaveinfo: "",
            training: false,
            selectednode: null,
        }

        var self = this;

        const parsed = queryString.parse(window.location.search);

        this.setupModelListeners();

        if (parsed.model) {
            httpjson("/model/load", { id: parsed.model }).then(
                (result) => {
                    if (!result.ok) {
                        console.log("Loading model failed");
                        return;
                    }

                    result.json().then(res => {
                        console.log("Loading model", res);
                        //First we want to update our diagram model
                        model.deSerializeDiagram(res.diagram, engine);
                        engine.repaintCanvas();

                        //Then lets update our db model
                        self.setState((state) => {
                            for (var x in res.model) {
                                state.model[x] = res.model[x];
                            }
                            state.saved = true;
                            return state;
                        });
                    })
                },

            )
        } else {
            this.createDemoNodes();
        }

        engine.setDiagramModel(model);
        this.addNewNode = this.addNewNode.bind(this);
        this.saveModel = this.saveModel.bind(this);
        this.trainModel = this.trainModel.bind(this);
        this.runModel = this.runModel.bind(this);
    }

    setupModelListeners() {
        var self = this;
        const { model } = this.props;
        model.addListener({
            nodesUpdated: e => {
                // console.log("nodesUpdated", e.node)
                e.node.addListener({
                    selectionChanged: (e) => {
                        // console.log("selectionChanged", e);
                        if (e.isSelected) {
                            self.setState({ selectednode: e.entity });
                            // e.firing = false;
                        } else {
                            self.setState({ selectednode: null });
                        }

                    }
                });
            },
            // linksUpdated: e => console.log("linksUpdated", e),

            // these are never triggered
            // zoomUpdated: e => console.log("zoomUpdated", e),
            // gridUpdated: e => console.log("gridUpdated", e),
            // offsetUpdated: e => console.log("offsetUpdated", e),
            // entityRemoved: e => console.log("entityRemoved", e),
            // selectionChanged: e => console.log("selectionChanged", e)
        });
    }

    createDemoNodes() {
        const { model } = this.props;

        var fallback = new IntentFallbackNodeModel();
        fallback.setPosition(50, 50);
        fallback.setActionTexts(["I do not understand.", "Please say again"]);

        var mynode1 = new IntentNodeModel("Greetings");
        mynode1.setPosition(500, 50);
        mynode1.setIntentTexts(["Hello", "Hi", "What's up"]);
        mynode1.setActionTexts(["Hi. How Can I help you", "Hello"]);

        var mynode2 = new IntentNodeModel("Introduce");
        mynode2.setPosition(500, 350);
        mynode2.setIntentTexts(["Who are you", "How this works"]);
        mynode2.setActionTexts(["I am chatbot built on Rasa", "I am your assistant today"]);

        var link = new DefaultLinkModel();
        link.setColor("green");
        link.setSourcePort(mynode1.getPort("out"));
        link.setTargetPort(mynode2.getPort("in"));

        model.addAll(fallback, mynode1, mynode2, link);
        model.name = "Test Model";
    }

    saveModel() {
        const { model } = this.props;
        var savemodel = {
            model: this.state.model,
            diagram: model.serializeDiagram(),
        }

        console.log("Save model", savemodel);

        this.setState({
            saving: true,
            saveinfo: "Parsing Diagram ...",
        });

        ajaxpost("/model/save", savemodel).then(
            (result) => {
                console.log("Saving modell success", result);
                this.setState({
                    saving: false,
                    saved: true,
                    saveinfo: "Parsing Diagram ...",
                });

                const parsed = queryString.parse(window.location.search);
                if (!parsed.model || parsed.model !== model.id) {
                    parsed.model = model.id;
                    window.location = window.location.pathname + "?" + queryString.stringify(parsed)
                }
            },
            (error) => {
                console.log("Failed to post hi message", error);
                this.setState({
                    saving: false,
                    saveinfo: error,
                });
            }
        )
    }

    trainModel() {
        const { model } = this.props;
        var jsm = { id: model.id };
        this.setState({
            training: true,
            saveinfo: "Training model ...",
        });
        ajaxpost("/model/train", jsm).then(
            (result) => {
                console.log("Training modell success", result);
                // this.setState({
                //     training: false,
                //     saveinfo: "Model trained",
                // });
                this.runModel()

            },
            (error) => {
                console.log("Failed to post hi message", error);
                this.setState({
                    training: false,
                    saveinfo: error,
                });
            }
        )
    }

    runModel() {
        const { model } = this.props;
        var jsm = { id: model.id };
        console.log("Setting state")
        this.setState({
            training: true,
            saveinfo: "Running model ...",
        });

        this.setIntentNodeActive("");
        ajaxpost("/model/run", jsm).then(
            (result) => {
                console.log("Training modell success", result);
                this.setState((state) => {
                    state.training = false;
                    state.saveinfo = "Model up and running";
                    state.model.httpport = result.httpport;
                    state.model.httpurl = result.httpurl;
                    return state;
                });
            },
            (error) => {
                console.log("Failed to post hi message", error);
                this.setState({
                    training: false,
                    saveinfo: error,
                });
            }
        )
    }

    addNewNode() {
        const { model } = this.props;
        var node = new IntentNodeModel("intent" + UID());
        console.log(model, model.offsetX, model.offsetY);
        var x = model.offsetX * (-1) + 50;
        var y = model.offsetY * (-1) + 50;

        node.setPosition(x, y);
        model.addAll(node);
        node.setSelected(true);
    }

    widgetEditorSubmit(node, values) {
        const { engine } = this.props;

        console.log(values);
        // console.log("widgetEditorSubmit", node, values);
        node.name = node.intent.name;
        node.intent = values.intent;
        node.actions = values.actions;

        if (node.intent.type === "text") {
            for (var x in node.actions) {
                //Just prefix all actions with current intent name for easier debuging on rasa
                node.actions[x].name = node.intent.name + UID();
            }
        }

        this.setState({
            saved: false,
        })
        engine.repaintCanvas();
    }

    widgetEditorKeypress(event) { //Had to stop stupid keypropagation
        event.stopPropagation();
    }

    handleModelNameChange = (event) => {
        const val = event.target.value;
        this.setState((state) => {
            state.model.name = val;
            return state;
        });
    }

    handleChatIntentChange = (tracker) => {
        var intent = tracker.latest_message.intent;
        this.setIntentNodeActive(intent.name);
    }

    setIntentNodeActive = (name) => {
        const { engine, model } = this.props;
        for (var id in model.nodes) {
            model.nodes[id].active = (model.nodes[id].intent.name === name);
        }

        engine.repaintCanvas();
    }

    render() {
        const { engine } = this.props;

        var weditor;
        var selnode = this.state.selectednode;
        var controlcontent;
        var editorheader;

        if (selnode) {
            editorheader = "Widget Editor";

            weditor = (
                <WidgetsEditor
                    key={"wedit" + selnode.id}
                    node={selnode}
                    onSubmit={this.widgetEditorSubmit.bind(this, selnode)}
                />
            );
        } else {
            editorheader = "Designer";

            controlcontent = (
                <Form>
                    <Form.Group widths='equal'>
                        <Form.Input width={10} type="text" value={this.state.model.name} onChange={this.handleModelNameChange} />
                        <Form.Button fluid width={6} color='blue' loading={this.state.saving} onClick={this.saveModel}>Save Model</Form.Button>
                    </Form.Group>
                    <Form.Group widths='equal'>
                        <Form.Button fluid width={6} color='teal' disabled={this.state.training || !this.state.saved} loading={this.state.training} onClick={this.trainModel}>Train Model</Form.Button>
                    </Form.Group>
                    <Form.Field>
                        <label>BOT URL: {this.state.model.httpurl}</label>
                    </Form.Field>
                </Form>
            )

            weditor = (
                <div>
                    <Header size="medium">Nodes</Header>
                    <Button color='teal' onClick={this.addNewNode}>Add New Node</Button>
                </div>
            );
        }

        return (
            <React.Fragment>
                <DiagramWidget className="diagram-canvas" diagramEngine={engine} />
                <div className="diagram-editor" onKeyDown={this.widgetEditorKeypress} onKeyPress={this.widgetEditorKeypress} onKeyUp={this.widgetEditorKeypress}>
                    <EditorHeader>{editorheader}</EditorHeader>
                    {controlcontent}
                    <ChatWindow
                        hide={selnode != null}
                        key={"chatbot" + this.state.model.httpport}
                        httpurl={this.state.model.httpurl}
                        onIntentChange={this.handleChatIntentChange}
                    />
                    {weditor}
                </div>
            </React.Fragment>
        )
    }
}

export default (props) => {
    console.log("Drawing canvas");
    const engine = new DiagramEngine();
    engine.installDefaultFactories();

    // register some other factories as well
    engine.registerPortFactory(new SimplePortFactory("intent", function () { return new IntentPortModel() }));
    engine.registerNodeFactory(new IntentNodeFactory());

    const model = new DiagramModel();

    return <Dashboard className="srd-demo-canvas" engine={engine} model={model} />;
};