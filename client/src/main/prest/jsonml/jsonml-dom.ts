
import {
    JsonML,
    JsonMLs,
    JsonMLObj,
    JsonMLFnc,
    Attrs,
    JsonMLHandler,
    jsonml
} from "./jsonml";


class JsonmlDomHandler implements JsonMLHandler {

    element: HTMLElement;

    private _current: HTMLElement;

    open(tag: string, attrs: Attrs, children: number, ctx?: any): boolean {
        const e = document.createElement(tag);
        let id: string = attrs._id;
        let classes: string[] = attrs._classes ? attrs._classes : [];
        let widget: any = attrs._widget;
        for (const a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                switch (a) {
                    case "_id":
                    case "_classes":
                    case "_ref":
                    case "_key":
                    case "_skip":
                    case "_widget":
                        break;
                    case "id":
                        id = attrs[a];
                        break;
                    case "classes":
                        classes = classes.concat(attrs[a]);
                        break;
                    case "class":
                        classes = classes.concat(attrs[a].split(" "));
                        break;
                    case "data":
                        for (const d in attrs[a]) {
                            if (attrs[a].hasOwnProperty(d)) {
                                if (attrs[a][d].constructor === String) {
                                    e.dataset[d] = attrs[a][d];
                                } else {
                                    e.dataset[d] = JSON.stringify(attrs[a][d]);
                                }
                            }
                        }
                        break;
                    case "styles":
                        for (const d in attrs[a]) {
                            if (attrs[a].hasOwnProperty(d)) {
                                (e.style as any)[d] = attrs[a][d];
                            }
                        }
                        break;
                    default:
                        if (typeof attrs[a] === "function") {
                            e.addEventListener(a, attrs[a]);
                        } else {
                            e.setAttribute(a, attrs[a]);
                        }
                }
            }
        }
        if (id) {
            e.setAttribute("id", id);
        }
        if (classes.length) {
            e.classList.add(...classes);
        }
        if (this._current) {
            this._current.appendChild(e);
            this._current = e;
        } else {
            this.element = e;
            this._current = e;
        }
        if (widget && "mount" in widget && widget.mount.constructor === Function) {
            widget.mount(e);
        }
        return attrs._skip ? true : false;
    }

    close(tag: string, children: number, ctx?: any): void {
        if (this._current !== this.element) {
            this._current = this._current.parentElement;
        }
    }

    text(text: string, ctx?: any): void {
        this._current.appendChild(document.createTextNode(text));
    }

    fnc(fnc: JsonMLFnc, ctx?: any): void {
        fnc(this._current);
    }

    obj(obj: JsonMLObj, ctx?: any): void {
        if ("toJsonML" in obj) {
            jsonml(obj.toJsonML(), this, obj);
        } else {
            this.text("" + obj, ctx);
        }
    }

}

export function jsonml2dom(jsonML: JsonML, ctx?: any): HTMLElement {
    const handler = new JsonmlDomHandler();
    jsonml(jsonML, handler, ctx);
    return handler.element;
}

export function jsonmls2dom(jsonMLs: JsonMLs, ctx?: any): Node[] {
    const elems: Node[] = [];
    for (const jsonML of jsonMLs) {
        if (jsonML.constructor === String) {
            elems.push(document.createTextNode(jsonML as string));
        } else if ("toJsonML" in (jsonML as any)) {
            const obj = jsonML as JsonMLObj;
            elems.push(jsonml2dom(obj.toJsonML(), obj));
        } else {
            elems.push(jsonml2dom(jsonML as JsonML, ctx));
        }
    }
    return elems;
}
