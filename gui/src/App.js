import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { HomePage } from "./HomePage/HomePage";
import { Designer } from "./Designer/Designer";
import './App.css';

function App() {
	return (
		<Router>
			<Route exact path="/" component={HomePage} />
			<Route path="/home" component={HomePage} />
			<Route path="/designer/editor" component={Designer} />
			<Route path="/designer/actions" component={Designer} />
		</Router>
	);
}
export default App;
