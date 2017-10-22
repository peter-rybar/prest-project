
import { JsonMLObj, JsonMLs, JsonML } from "./jsonml";


export interface DomWidget {
    mount(e: HTMLElement): this;
    umount(): this;
    onMount?(): void;
    onUmount?(): void;
}

export abstract class Widget implements JsonMLObj, DomWidget {

    private static __count = 0;

    readonly type: string = "Widget"; // this.constructor.name;
    readonly id: string = this.type + "-" + Widget.__count++;
    readonly dom: HTMLElement;
    readonly refs: { [key: string]: HTMLElement } = {};

    private _updateSched: number;

    constructor(type: string = "") {
        if (type) {
            this.type = type;
        }
    }

    abstract render(): JsonMLs;

    mount(e: HTMLElement = document.body): this {
        return this;
    }

    umount(): this {
        return this;
    }

    update(): this {
        return this;
    }

    toJsonML(): JsonML {
        if (this.dom) {
            if (this._updateSched) {
                clearTimeout(this._updateSched);
                this._updateSched = null;
            } else {
                return [
                    this.type, {
                        _skip: true,
                        _id: this.id,
                        _key: this.id
                    }
                ];
            }
        }
        const jsonMLs = (this as any).render();
        return [
            "div", {
                _id: this.id,
                _key: this.id,
                widget: this.type
            },
            ...jsonMLs
        ];
    }

}
