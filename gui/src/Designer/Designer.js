import React from "react";
import { BrowserRouter as Router, Link, NavLink, Route } from "react-router-dom";
import { Menu } from 'semantic-ui-react';
import Diagram from './Diagram'
import { Actions } from "./Actions";

function Designer({ match, location }) {
    const Nav = (props) => {
        const isActive = (match, location) => {
            return location.pathname + location.search === props.to;
        }

        return <NavLink
            // exact
            {...props}
            isActive={isActive}
            activeClassName="active"
        />
    };

    return (
        <Router>
            <Menu className="nav-menu" size="large" >
                <Menu.Item
                    as={Nav}
                    to={`/designer/editor${location.search}`}
                    content="Designer" />
                <Menu.Item
                    as={Nav}
                    to={`/designer/actions${location.search}`}
                    content="Actions"
                />
            </Menu>
            {/* <Route exact path="/designer" component={DiagramDesigner} /> */}
            <Route path="/designer/editor" component={DesignerEditor} />
            <Route path="/designer/actions" component={DesignerActions} />
        </Router>
    );
}

function DesignerEditor({ match }) {
    return (
        <div id="diagram-container">
            <Diagram />
        </div>
    );
}

function DesignerActions({ match }) {
    return (
        <div id="actions-container">

            <Actions />
        </div>
    );
}

export {
    Designer,
}