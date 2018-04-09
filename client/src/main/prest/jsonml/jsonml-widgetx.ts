import { Widget } from "./jsonml-widget";
import { Events } from "../events";


export abstract class WidgetX<S> extends Widget {

    protected _state: S;

    readonly events: Events<this>;

    constructor(type: string = "", state?: S, events?: Events<any>) {
        super(type);
        if (typeof state !== "undefined") {
            this.state = state;
        }
        this.events = events ? events : new Events<this>(this);
        console.log(event);
    }

    set state(state: S) {
        this._state = state;
        this.update();
    }

    get state(): S {
        return this._state;
    }

}
