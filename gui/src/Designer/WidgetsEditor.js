import React from 'react';
import { Button, Dropdown, Form, Header, Input, Message, TextArea } from 'semantic-ui-react';
import { arrayToObject, loopObject, UID } from '../Helpers/Helpers';
import { RasaAction, RasaButton } from "../Rasa/Models";
import './Designer.css';
// import _ from 'loadash'


export class WidgetsEditor extends React.Component {
    constructor(props) {
        super(props);
        const { node } = props;
        this.state = {
            name: node.name,
            intent: node.intent,
            actions: arrayToObject(node.actions, "name"),
        }

        this.state.intent.text = this.state.intent.texts.join("\n");
        for (var x in this.state.actions) {
            var action = this.state.actions[x];
            if (action.type === "utter") {
                this.state.actions[x].text = action.texts.join("\n")
            }
        }

        console.log(this.state.actions);

        this.submitHandler = this.submitHandler.bind(this);
    }

    setAction(action) {
        this.setState((state) => {
            state.actions[action.name] = action;
            return state;
        });
    }

    findAction(name) {
        return this.state.actions[name];
    }

    deleteAction(name) {
        this.setState((state) => {
            delete state.actions[name];

            // for (var x in state.actions) {
            //     if (state.actions[x].name === name) {
            //         state.actions.splice(x, 1);
            //     }
            // }
            return state;
        });
    }

    handleIntentInputChange = (event) => {
        const value = event.target.value;
        this.setState((state) => {
            state.intent.name = value;
            return state;
        });
    }

    handleIntentTextChange = (event) => {
        const value = event.target.value;
        this.setState((state) => {
            state.intent.text = value;
            state.intent.texts = value.split("\n");
            return state;
        });
    }

    handleAddAction = (e, { value }) => {
        e.persist();
        if (value === "") {
            return;
        }

        var a = new RasaAction(value, UID());
        if (a.type !== "utter" && a.type !== "utter_buttons") {
            a.text = e.target.textContent
        }
        this.setAction(a);
    }

    handleActionUtterInputChange = (event, { iaction }) => {
        // console.log(e, value);
        const value = event.target.value;
        iaction.text = value;
        iaction.texts = value.split("\n");
        this.setAction(iaction);
    }

    handleActionDismiss = (e, { action_name }) => {
        this.deleteAction(action_name);
    }

    handleActionTextChange = (e, { value }) => {
        console.log(value);
    }

    handleActionAddButton = (e, { iaction }) => {
        // var action = this.findAction(action_name);
        var btn = new RasaButton();
        iaction.buttons.push(btn);
        this.setAction(iaction);
    }

    handleActionButtonInputChange = (e, { iaction, btn, index }) => {
        var value = e.target.value;
        iaction.buttons[index][btn] = value;
        this.setAction(iaction);
    }

    handleActionButtonUtterInputChange = (event, { iaction }) => {
        const value = event.target.value;
        iaction.text = value;
        this.setAction(iaction);
    }

    submitHandler() {
        console.log("SUBMIT");
        var res = this.state;
        res.actions = Object.values(res.actions);
        this.props.onSubmit(res);
    }

    render() {
        const { node } = this.props;

        const actionsList = [
            { key: 'utter', value: 'utter', text: 'Response' },
            { key: 'utter_buttons', value: 'utter_buttons', text: 'Response & Buttons' },
            { key: 'action_listen', value: 'action_listen', text: 'Listen' },
            { key: 'action_restart', value: 'action_restart', text: 'Restart' },
            { key: 'action_default_fallback', value: 'action_default_fallback', text: 'Fallback' },
            { key: 'action_deactivate_form', value: 'action_deactivate_form', text: 'Deactivate Form' },
            { key: 'action_default_ask_affirmation', value: 'action_default_ask_affirmation', text: 'Ask Affirmation' },
            { key: 'action_revert_fallback_events', value: 'action_revert_fallback_events', text: 'Revert Fallback Events' },
            { key: 'action_default_ask_rephrase', value: 'action_default_ask_rephrase', text: 'Ask to Rephrase Intent' },
            { key: 'action_back', value: 'action_back', text: 'Undo Last User Intent' },
        ]

        // const { engine } = this.props;
        // console.log("rendering widget editor");
        return (
            <div className="widget-editor-container" >
                <Form onSubmit={this.submitHandler}>
                    <Form.Field>
                        <label>Name</label>
                        <Input key="wname" disabled={node.name === 'default'} placeholder='Name' value={this.state.intent.name} onChange={this.handleIntentInputChange} />
                    </Form.Field>
                    <Header size="small">Intents</Header>
                    <Form.Field>
                        <Message>
                            <Message.Header className="we-msg-header">Intents</Message.Header>
                            <Message.Content>
                                <TextArea key="winputsentences"
                                    className="we-textarea"
                                    // name={this.state.intent.name}
                                    placeholder='Press Enter to add more'
                                    value={this.state.intent.text}
                                    onChange={this.handleIntentTextChange}>
                                </TextArea>
                            </Message.Content>
                        </Message>
                    </Form.Field>
                    <Header size="small">Actions</Header>
                    {loopObject(this.state.actions, (action, index) => {
                        if (action.type === "utter") {
                            return (
                                <Form.Field key={"we-field" + action.name + index}>
                                    <Message
                                        onDismiss={this.handleActionDismiss}
                                        action_name={action.name}
                                    >
                                        <Message.Header className="we-msg-header">Responses</Message.Header>
                                        <Message.Content>
                                            <TextArea
                                                className="we-textarea"
                                                placeholder='Press Enter to add more'
                                                value={action.text}
                                                iaction={action}
                                                onChange={this.handleActionUtterInputChange}>
                                            </TextArea>
                                        </Message.Content>
                                    </Message>
                                </Form.Field>
                            )
                        }

                        if (action.type === "utter_buttons") {
                            return (
                                <Form.Field key={"we-field" + action.name + index}>
                                    <Message key={"we-field-message" + action.name + index}
                                        onDismiss={this.handleActionDismiss}
                                        action_name={action.name}
                                    >
                                        <Message.Header className="we-msg-header">Buttons</Message.Header>
                                        <Message.Content>
                                            <Form.Field>
                                                <Input placeholder='Ask' iaction={action} value={action.text} onChange={this.handleActionButtonUtterInputChange} ></Input>
                                            </Form.Field>
                                            {
                                                action.buttons.map((b, index) => {
                                                    return (
                                                        <Form.Field key={"we-field-btn" + action.name + index}>
                                                            <Input placeholder='Title' style={{ width: '50%' }} value={b.title} iaction={action} btn={'title'} index={index} onChange={this.handleActionButtonInputChange} />
                                                            <Input placeholder='Intent' style={{ width: '50%' }} value={b.payload} iaction={action} btn={'payload'} index={index} onChange={this.handleActionButtonInputChange} />
                                                        </Form.Field>
                                                    )
                                                })
                                            }
                                            <Button type='button' circular icon='add' size='tiny' iaction={action} onClick={this.handleActionAddButton} />

                                        </Message.Content>
                                    </Message>
                                </Form.Field>
                            )
                        }

                        return (
                            <Form.Field key={"we-field" + action.name + index}>
                                <Message key={"we-field-message" + action.name + index}
                                    onDismiss={this.handleActionDismiss}
                                    // header='Welcome back!'
                                    action_name={action.name}
                                    content={action.text}
                                />
                            </Form.Field>
                        )
                    })}

                    <Form.Field>
                        <label>Add more actions</label>
                        <Dropdown
                            placeholder='Select Action'
                            fluid
                            search
                            selection
                            options={actionsList}
                            onChange={this.handleAddAction}
                            value={""}
                        // defaultValue={""}
                        />
                    </Form.Field>

                    <Button color='blue' type='submit'>Submit</Button>
                </Form>
            </div>
        )
    }
}