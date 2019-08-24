

export class Backend {
    constructor(url = "http://localhost:5000") {
        this.url = url;
    }

    http(uri, params, method = 'POST') {
        return fetch(this.url + uri, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });
    }

    get(uri, params) {
        return this.http(uri, params, 'GET').then(res => res.json())
    }

    post(uri, params) {
        return this.http(uri, params, 'POST').then(res => res.json())
    }
}