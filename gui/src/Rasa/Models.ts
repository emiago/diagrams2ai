

export class RasaIntent {
    type: string;
    name: string;
    text!: string;
    texts: string[];
    constructor(type: string, name: string) {
        this.type = type;
        this.name = name;
        this.texts = [];
    }
}

export class RasaButton {
    title: string
    payload: string
    constructor() {
        this.title = "";
        this.payload = "";
    }
}

export class RasaAction {
    type: string;
    name: string;
    text!: string;
    texts: string[];
    buttons: RasaButton[];
    constructor(type: string, name: string) {
        this.type = type;
        this.name = name;
        this.text = "";
        this.texts = [];
        this.buttons = [];
    }
}