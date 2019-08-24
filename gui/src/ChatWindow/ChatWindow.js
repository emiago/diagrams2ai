import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import { Header, Input } from 'semantic-ui-react';
import { UID } from '../Helpers/Helpers';
import { Backend } from '../Backend';
import './ChatWindow.css';
import { MsgReceive, MsgSend } from './Message';

/* 
    This should be developed as separated component. 
    It should be usable with other projects
*/

class ChatInput extends React.Component {
    constructor(props) {
        super(props);
        this.handleInputKeypress = this.handleInputKeypress.bind(this);
    }

    handleInputKeypress(event) {
        if (event.key === 'Enter' || event.charCode === 13) {
            this.props.handleEnterMessage(event.currentTarget.value);
            event.currentTarget.value = "";
        }

    }

    render() {
        return (
            <div>
                <Input style={{ width: '100%' }} icon='location arrow' placeholder='Send...' onKeyPress={this.handleInputKeypress} />
            </div>
        );
    }

}

class ChatWindow extends React.Component {
    constructor(props) {
        super(props);
        const { httpurl } = this.props;

        this.state = {
            messages: [],
        }

        this.userId = "user" + UID();
        this.backend = new Backend(httpurl);

        console.log("Chat listening on", httpurl);
        this.handleEnterMessage = this.handleEnterMessage.bind(this);
    }

    postNewMessage(result) {
        console.log("Got response", result);

        this.setState((state) => {
            for (var i in result) {
                var m = result[i];
                state.messages.push({
                    sender: "",
                    text: m.text,
                    buttons: m.buttons || [],
                });
            }
            // console.log("newConversations", state.conversations);
            return state;
        })

        this.backend.get("/conversations/" + this.userId + "/tracker").then(
            (result) => {
                this.props.onIntentChange(result);
            },
            (error) => {
                console.log("Failed to post new message", error);
            }
        )
    }

    sendMessage(input) {
        var msg = {
            sender: this.userId,
            message: input,
        }

        this.backend.post("/webhooks/rest/webhook", msg).then(
            (result) => {
                this.postNewMessage(result);
            },
            (error) => {
                console.log("Failed to post new message", error);
            }
        )
    }

    handleEnterMessage(input) {
        console.log("Mesage entered ", input);

        this.setState((state) => {
            state.messages.push({
                sender: this.userId,
                text: input,
            });
            // console.log("newConversations", state.conversations);
            return state;
        })
        this.sendMessage(input);
    }

    handleButtonClick(event) {
        this.handleEnterMessage(event.target.value);
    }

    // componentWillUpdate() {
    //     const node = this.node;
    //     this.shouldScrollBottom = node.scrollTop +
    //         node.offsetHeight === node.scrollHeight;
    // }

    // componentDidUpdate() {
    //     console.log("UPDATING SCROLL", this.node);
    //     const node = this.node;
    //     this.shouldScrollBottom = node.scrollTop +
    //         node.offsetHeight === node.scrollHeight;
    // }

    render() {
        var msgelems = [];
        for (var mi in this.state.messages) {
            var m = this.state.messages[mi];
            if (m.sender === this.userId) {
                msgelems.push(<MsgSend key={mi} uid={"msg" + mi} msg={m} />);
            } else {
                msgelems.push(<MsgReceive key={mi} uid={"msg" + mi} msg={m} handleButtonClick={this.handleButtonClick.bind(this)} />);
            }
        }

        var style = {};
        if (this.props.hide) {
            style.display = "none";
        }

        return (
            <div className="chatti-container" style={style}>
                <Header size="medium">Talk with bot</Header>
                <ScrollToBottom className="chatti-content">{msgelems}</ScrollToBottom>
                <ChatInput handleEnterMessage={this.handleEnterMessage}></ChatInput>
            </div>
        );
    }
}

export { ChatWindow };

