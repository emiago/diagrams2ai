import React from "react";
import { BrowserRouter as NavLink } from "react-router-dom";
import { Button, Header } from "semantic-ui-react";
import './HomePage.css'
import { ModelsList } from "./ModelsList";


class HomePage extends React.Component {
    onModelSelected(model) {
        this.props.history.push("/designer/editor?model=" + model.id)
    }

    render() {
        return (
            <div id="homepage">
                <NavLink to="/designer/editor"><Button color='blue'>Create New</Button></NavLink>
                <Header>Models:</Header>
                <ModelsList onModelSelected={this.onModelSelected.bind(this)} />
            </div>
        );
    }
}

export {
    HomePage
}