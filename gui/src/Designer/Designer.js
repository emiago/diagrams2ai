import React from "react";
import { BrowserRouter as Router, Link, NavLink, Route } from "react-router-dom";
import { Menu } from 'semantic-ui-react';
import Diagram from './Diagram'

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

class DesignerEditor extends React.Component {
    render() {
        return (
            <div id="diagram-container">
                <Diagram />
            </div>
        );
    }
}

function DesignerActions({ match }) {
    return (
        <div>
            <h2>Topics</h2>
            <ul>
                <li>
                    <Link to={`${match.url}/rendering`}>Rendering with React</Link>
                </li>
                <li>
                    <Link to={`${match.url}/components`}>Components</Link>
                </li>
                <li>
                    <Link to={`${match.url}/props-v-state`}>Props v. State</Link>
                </li>
            </ul>

            <Route path={`${match.path}/:topicId`} component={Topic} />
            <Route
                exact
                path={match.path}
                render={() => <h3>Please select a topic.</h3>}
            />
        </div>
    );
}

function Topic({ match }) {
    return (
        <div>
            <h3>{match.params.topicId}</h3>
        </div>
    );
}

export {
    Designer,
}