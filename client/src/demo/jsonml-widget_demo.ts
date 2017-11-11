
import { jsonmls2htmls } from "../main/prest/jsonml/jsonml-html";
import { JsonMLs } from "../main/prest/jsonml/jsonml";
import { Widget } from "../main/prest/jsonml/jsonml-widget";
import { Signal } from "../main/prest/signal";


class HelloWidget extends Widget {

    private _name: string;

    constructor(name: string) {
        super("HelloWidget");
        this._name = name;
    }

    setName(name: string): this {
        this._name = name;
        this.update();
        return this;
    }

    onMount() {
        console.log("onMount", this.type, this.id);
    }

    onUmount() {
        console.log("onUmount", this.type, this.id);
    }

    render(): JsonMLs {
        return [
            ["input~i", { type: "text", value: this._name, input: this._onTextInput }],
            ["p", "Hello ", ["strong", this._name], " !"]
        ];
    }

    private _onTextInput = (e: Event) => {
        const i = e.target as HTMLInputElement;
        // const i = this.refs["i"] as HTMLInputElement;
        this._name = i.value;
        this.update();
    }

}


class TimerWidget extends Widget {

    private _interval: number;

    constructor() {
        super("TimerWidget");
    }

    toggle(on?: boolean): void {
        switch (on) {
            case true:
                if (!this._interval) {
                    this._interval = setInterval(() => this.update(), 1000);
                }
                break;
            case false:
                if (this._interval) {
                    clearInterval(this._interval);
                    this._interval = undefined;
                }
                break;
            default:
                this.toggle(!this._interval);
        }
        this.update();
    }

    onMount() {
        console.log("onMount", this.type, this.id);
        this.toggle(true);
    }

    onUmount() {
        console.log("onUmount", this.type, this.id);
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


interface FormData {
    name: string;
    age: number;
}

interface FormErrors {
    name: string;
    age: string;
}

class FormWidget extends Widget {

    private _title: string = "Form";
    private _data: FormData = { name: undefined, age: undefined };
    private _errors: FormErrors = { name: "", age: "" };

    readonly sigData = new Signal<FormData>();

    constructor() {
        super("FormWidget");
    }

    getTitle(): string {
        return this._title;
    }

    setTitle(title: string): this {
        this._title = title;
        this.update();
        return this;
    }

    getData(): FormData {
        return this._data;
    }

    setData(data: FormData): this {
        this._data = data;
        this.update();
        return this;
    }

    onMount() {
        console.log("onMount", this.type, this.id);
    }

    onUmount() {
        console.log("onUmount", this.type, this.id);
    }

    render(): JsonMLs {
        return [
            ["h2", this._title],
            ["form", { submit: this._onFormSubmit },
                ["p",
                    ["label", "Name ",
                        ["input~name",
                            {
                                type: "text", size: 10, maxlength: 10,
                                input: this._onNameInput
                            }
                        ]
                    ], " ",
                    ["em.error", this._errors.name]
                ],
                ["p",
                    ["label", "Age ",
                        ["input~age",
                            {
                                type: "number", min: "1", max: "120",
                                input: this._onAgeInput
                            }
                        ]
                    ], " ",
                    ["em.error", this._errors.age]
                ],
                ["p",
                    ["input~submit", { type: "submit", value: "Submit" }]
                ]
            ],
            ["pre~data"]
        ];
    }

    private _onFormSubmit = (e: Event) => {
        e.preventDefault();
        console.log("submit", this._data);
        this._validateName((this.refs["name"] as HTMLInputElement).value);
        this._validateAge((this.refs["age"] as HTMLInputElement).value);
        if (this._errors.name || this._errors.age) {
            this.update();
        } else {
            this.sigData.emit(this._data);
            this.refs["data"].innerText = JSON.stringify(this._data, null, 4);
        }
    }

    private _onNameInput = (e: Event) => {
        const i = e.target as HTMLInputElement;
        // const i = this.refs["name"] as  HTMLInputElement;
        console.log("name", i.value);
        this._validateName(i.value);
        this.update();
    }

    private _onAgeInput = (e: Event) => {
        const i = e.target as HTMLInputElement;
        // const i = this.refs["age"] as  HTMLInputElement;
        console.log("age", i.value);
        this._validateAge(i.value);
        this.update();
    }

    private _validateName(name: string) {
        if (name) {
            this._data.name = name;
            this._errors.name = "";
        } else {
            this._data.name = undefined;
            this._errors.name = "Name required";
        }
    }

    private _validateAge(age: string) {
        if (age) {
            if (isNaN(+age)) {
                this._data.age = undefined;
                this._errors.age = "Invalid age number";
            } else {
                this._data.age = +age;
                this._errors.age = "";
            }
        } else {
            this._data.age = undefined;
            this._errors.age = "Age required";
        }
    }

}


class AppWidget extends Widget {

    private _title: string = "App";

    readonly helloWidget: HelloWidget;
    readonly timerWidget: TimerWidget;
    readonly formWidget: FormWidget;

    constructor() {
        super("AppWidget");
        this.helloWidget = new HelloWidget("peter");
        this.timerWidget = new TimerWidget();
        this.formWidget = new FormWidget();
        this.formWidget.sigData.connect(data => console.log("sig data", data));
    }

    setTitle(title: string): this {
        this._title = title;
        this.update();
        return this;
    }

    onMount() {
        console.log("onMount", this.type, this.id);
    }

    onUmount() {
        console.log("onUmount", this.type, this.id);
    }

    render(): JsonMLs {
        return [
            ["h1", this._title],
            this.helloWidget,
            ["hr"],
            this.timerWidget,
            ["hr"],
            this.formWidget
        ];
    }

}


const app = new AppWidget()
    .setTitle("MyApp")
    .mount(document.getElementById("app"));
(self as any).app = app;


// app html
const html = jsonmls2htmls(
    [
        "app html",
        new AppWidget().setTitle("MyApp").toJsonML()
    ],
    true).join("");
console.log(html);
