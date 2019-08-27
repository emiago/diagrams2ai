import React from 'react';
import { Backend } from '../Backend';
import queryString from 'query-string';


class Actions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            model: {
                id: "",
                actions: {},
            }
        }

        this.backend = new Backend();
        const parsed = queryString.parse(window.location.search);
        var self = this;

        if (parsed.model) {
            this.backend.http("/model/load", { id: parsed.model }, "POST").then(
                (result) => {
                    if (!result.ok) {
                        console.log("Loading model failed");
                        return;
                    }

                    result.json().then(res => {
                        console.log("Loading model", res);
                        //Then lets update our db model
                        self.setState((state) => {
                            for (var x in res.model) {
                                state.model[x] = res.model[x];
                            }
                            return state;
                        });
                    })
                },

            )
        } else {
        }
    }

    render() {
        return (
            <>
                <h1>HERE SHOULD BE ACTION CUSTOMIZATION</h1>
            </>
        );
    }
}

export {
    Actions
}