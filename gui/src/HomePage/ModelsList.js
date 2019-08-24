import React from 'react';
import './HomePage';
import { Table } from 'semantic-ui-react';
import { Backend } from '../Backend';

export class ModelsList extends React.Component {
    constructor(props) {
        super(props);
        this.backend = new Backend();
        this.state = {
            selectedmodel: "",
            models: [],
        }
        this.backend.get("/models/list").then(
            (result) => {
                this.setState({ models: result });
            },
            (error) => {
                console.log("Failed to post new message", error);
            }
        );
    }

    render() {
        return (
            <Table celled selectable>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Id</Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell width={1}></Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {
                        this.state.models.map((model, index) => {
                            return (
                                <Table.Row key={model.id} onClick={this.props.onModelSelected.bind(null, model)}>
                                    <Table.Cell>{model.id}</Table.Cell>
                                    <Table.Cell>{model.name}</Table.Cell>
                                    <Table.Cell>Delete</Table.Cell>
                                </Table.Row>
                            )
                        })
                    }
                </Table.Body>
            </Table>
        );
    }
}