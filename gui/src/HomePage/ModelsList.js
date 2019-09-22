import React from 'react';
import './HomePage';
import { Table, Button } from 'semantic-ui-react';
import { Backend } from '../Backend';

export class ModelsList extends React.Component {
    constructor(props) {
        super(props);
        this.backend = new Backend();
        this.state = {
            selectedmodel: "",
            models: [],
        }
        this.getModelsList()
    }

    getModelsList() {
        this.backend.get("/models/list").then(
            (result) => {
                this.setState({ models: result });
            },
            (error) => {
                console.log("Failed to post new message", error);
            }
        );
    }

    handleModelDelete = (id) => {
        this.backend.post("/model/delete", { "id": id }).then(
            (result) => {
                this.getModelsList();
            },
            (error) => {
                console.log("Failed to delete model", error);
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
                                <Table.Row key={model.id} >
                                    <Table.Cell onClick={this.props.onModelSelected.bind(null, model)}>{model.id}</Table.Cell>
                                    <Table.Cell onClick={this.props.onModelSelected.bind(null, model)}>{model.name}</Table.Cell>
                                    <Table.Cell >
                                        <Button onClick={this.handleModelDelete.bind(null, model.id)}>Delete</Button>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })
                    }
                </Table.Body>
            </Table>
        );
    }
}