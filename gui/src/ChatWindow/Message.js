import React from 'react';
import { Label, Button } from 'semantic-ui-react'
import './ChatWindow.css';

function MsgReceive(props) {
    const { msg, handleButtonClick, uid } = props;
    var text;
    var buttons;

    if (msg.buttons && msg.buttons.length > 0) {
        buttons = (
            <div className="chatti-msgwrap">
                {
                    msg.buttons.map((btn, index) => {
                        return (
                            <Button key={uid + "chat-btn" + index} onClick={handleButtonClick} basic color='blue' value={btn.payload}>{btn.title}</Button>
                        )
                    })
                }
            </div>
        );
    }

    if (msg.text !== "") {
        text = <Label as='a' basic color='blue'>
            {msg.text}
        </Label>;
    }

    // console.log(msg, content);

    return (
        <div className="chatti-msgwrap">
            {text}
            {buttons}
        </div>
    );
}

function MsgSend(props) {
    const { msg } = props;
    return (
        <div className="chatti-msgwrap right">
            <Label as='a' basic color='black'>
                {msg.text}
            </Label>
        </div>
    );
}

export {
    MsgReceive,
    MsgSend,
}