import React from 'react';
import { Backend } from '../Backend';
import queryString from 'query-string';
import {
    Grid,
    Form,
    TextArea,

} from 'semantic-ui-react';
import { RasaAction } from '../Rasa/Models';


class Actions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            actions: {
                action_default_fallback: new RasaAction("action_default_fallback", "action_default_fallback"),
            },
        }

        this.backend = new Backend();
        const parsed = queryString.parse(window.location.search);
        var self = this;

        if (parsed.model) {
            this.backend.http("/model/data/load", { id: parsed.model }, "POST").then(
                (result) => {
                    if (!result.ok) {
                        console.log("Loading model actions failed");
                        return;
                    }

                    result.json().then(res => {
                        console.log("Loading model actions", res);
                        //Then lets update our db model
                        self.setState((state) => {
                            for (var x in res) {
                                state[x] = res[x];
                            }
                            return state;
                        });
                    })
                },

            )
        } else {
        }
    }

    handleFallbackActionTextChange = (event) => {
        const value = event.target.value;
        this.setState((state) => {
            state.actions.action_default_fallback.text = value;
            state.actions.action_default_fallback.texts = value.split("\n");
            return state;
        });
    }

    submitHandler = (event) => {
        var res = this.state;
        console.log("SUBMIT");
        this.backend.http("/model/data/save", res, "POST").then(
            (result) => {
                if (!result.ok) {
                    console.log("Saving model actions failed");
                    return;
                }

                result.json().then(res => {
                    console.log("Saveing model actions", res);
                })
            },

        )
    }

    render() {
        return (
            <Form style={{ padding: "20px" }} onSubmit={this.submitHandler}>
                <Form.Group unstackable widths={3}>
                    <Form.Field>
                        <label>Fallback Action</label>
                        <Form.TextArea style={{ minHeight: "120px" }}
                            placeholder='Press Enter to add more'
                            value={this.state.actions.action_default_fallback.text}
                            onChange={this.handleFallbackActionTextChange}>
                            ></Form.TextArea>
                    </Form.Field>
                </Form.Group>
                <Form.Button type='submit'>Submit</Form.Button>
            </Form >
        );
    }
}

export {
    Actions
}