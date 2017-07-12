
import { JsonMLs, jsonmls2html } from "../main/prest/jsonml";
import { Widget } from "../main/prest/jsonml-widget";


class Hello extends Widget {

    private _name: string;

    constructor(name: string) {
        super("Hello");
        this._name = name;
    }

    setName(name: string): this {
        this._name = name;
        this.update();
        return this;
    }

    domAttach() {
        console.log("domAttach", this.type, this.id);
    }

    domDetach() {
        console.log("domDetach", this.type, this.id);
    }

    render(): JsonMLs {
        return [
            ["input~i", { type: "text", value: this._name,
                input: (e: Event) => {
                    // const i = e.target as HTMLInputElement;
                    const i = this.refs["i"] as  HTMLInputElement;
                    this._name = i.value;
                    this.update();
                } }
            ],
            ["p", "Hello ", ["strong", this._name], " !"]
        ];
    }
}


class Timer extends Widget {

    private _interval: number;

    constructor() {
        super("Timer");
    }

    toggle(on?: boolean): void {
        if (on === true) {
            if (!this._interval) {
                this._interval = setInterval(() => this.update(), 1000);
            }
        } else if (on === false) {
            if (this._interval) {
                clearInterval(this._interval);
                this._interval = undefined;
            }
        } else {
            this.toggle(!this._interval);
        }
        this.update();
    }

    domAttach() {
        console.log("domAttach", this.type, this.id);
        this.toggle(true);
    }

    domDetach() {
        console.log("domDetach", this.type, this.id);
        this.toggle(false);
    }

    render(): JsonMLs {
        return [
            ["p", { style: this._interval ? "" : "color: lightgray;" },
                "Time: ", new Date().toLocaleTimeString(), " ",
                ["button", { click: (e: Event) => this.toggle() },
                    this._interval ? "Stop" : "Start"
                ]
            ]
        ];
    }

}


class App extends Widget {

    private _title: string;

    readonly hello: Hello;
    readonly timer: Timer;

    constructor(title: string) {
        super("App");
        this._title = title;
        this.hello = new Hello("peter");
        this.timer = new Timer();
    }

    setTitle(title: string): this {
        this._title = title;
        return this;
    }

    domAttach() {
        console.log("domAttach", this.type, this.id);
    }

    domDetach() {
        console.log("domDetach", this.type, this.id);
    }

    render(): JsonMLs {
        return [
            ["h1", this._title],
            this.hello,
            ["hr"],
            this.timer
        ];
    }

}


const app = new App("MyApp").mount(document.getElementById("app"));
(self as any).app = app;

// app html
jsonmls2html(
    ["app html", app.toJsonML()],
    html => console.log(html),
    true);
