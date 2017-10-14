
export interface Attrs {
    _id?: string;
    _classes?: string[];
    _ref?: string;
    _key?: string;
    _skip?: boolean;
    data?: {[key: string]: any};
    styles?: {[key: string]: string};
    classes?: string[];
    [key: string]: any;
}

export type JsonMLFnc = (e?: HTMLElement) => void;

export interface JsonMLObj {
    toJsonML?(): JsonML;
}

export interface JsonML extends Array<string | Attrs | JsonML | JsonMLFnc | JsonMLObj> {
    // 0: string;
    // 1?: Attrs | JsonML | JsonMLFnc | JsonMObj;
}

export interface JsonMLs extends Array<JsonML | string | JsonMLObj> {
}


export interface JsonMLHandler {
    open(tag: string, attrs: Attrs, children: number, ctx?: any): boolean;
    close(tag: string, children: number, ctx?: any): void;
    text(text: string, ctx?: any): void;
    fnc(fnc: JsonMLFnc, ctx?: any): void;
    obj(obj: JsonMLObj, ctx?: any): void;
}

export function jsonml(jsonML: JsonML, handler: JsonMLHandler, ctx?: any): void {
    if (!jsonML) {
        return;
    }

    const head = jsonML[0] as string;
    const attrsObj = jsonML[1] as any;
    const hasAttrs = attrsObj && attrsObj.constructor === Object;
    const childIdx = hasAttrs ? 2 : 1;

    let children = 0;
    for (let i = childIdx; i < jsonML.length; i++) {
        if (jsonML[i] && jsonML[i].constructor !== Function) {
            children++;
        }
    }

    const refSplit = head.split("~");
    const ref = refSplit[1];
    const dotSplit = refSplit[0].split(".");
    const hashSplit = dotSplit[0].split("#");
    const tag = hashSplit[0] || "div";
    const id = hashSplit[1];
    const classes = dotSplit.slice(1);

    let attrs: Attrs;
    if (hasAttrs) {
        attrs = attrsObj as Attrs;
    } else {
        attrs = {};
    }

    if (id) {
        attrs._id = id;
    }
    if (classes.length) {
        attrs._classes = classes;
    }
    if (ref) {
        attrs._ref = ref;
    }

    const skip = handler.open(tag, attrs, children, ctx);

    if (!skip) {
        for (let i = childIdx, l = jsonML.length; i < l; i++) {
            const jml = jsonML[i] as any;
            if (jml === undefined) {
                continue;
            }
            switch (jml.constructor) {
                case Array:
                    jsonml(jml, handler, ctx);
                    break;
                case Function:
                    handler.fnc(jml, ctx);
                    break;
                case String:
                    handler.text(jml, ctx);
                    break;
                default:
                    handler.obj(jml, ctx);
            }
        }
    }

    handler.close(tag, children, ctx);
}


class JsonmlHtmlHandler implements JsonMLHandler {

    private _onHtml: (html: string) => void;
    private _pretty: boolean;
    private _indent: string;
    private _depth: number = 0;

    constructor(onHtml: (html: string) => void,
                pretty: boolean = false,
                indent: string = "    ") {
        this._onHtml = onHtml;
        this._pretty = pretty;
        this._indent = indent;
    }

    open(tag: string, attrs: Attrs, children: number, ctx?: any): boolean {
        const props: any[] = [];
        let id: string = attrs._id;
        let classes: string[] = attrs._classes ? attrs._classes : [];
        for (const a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                switch (a) {
                    case "_id":
                    case "_classes":
                    case "_ref":
                    case "_key":
                    case "_skip":
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
                                    props.push(["data-" + d, attrs[a][d]]);
                                } else {
                                    props.push(["data-" + d, JSON.stringify(attrs[a][d])]);
                                }
                            }
                        }
                        break;
                    case "styles":
                        let style = "";
                        for (const d in attrs[a]) {
                            if (attrs[a].hasOwnProperty(d)) {
                                const dd = d.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
                                style += dd + ":" + attrs[a][d] + ";";
                            }
                        }
                        props.push(["style", style]);
                        break;
                    default:
                        if (typeof attrs[a] !== "function") {
                            props.push([a, attrs[a]]);
                        }
                }
            }
        }
        if (classes.length) {
            props.unshift(["class", classes.join(" ")]);
        }
        if (id) {
            props.unshift(["id", id]);
        }
        const args = props.map(p => `${p[0]}="${p[1]}"`).join(" ");
        let html = "";
        if (this._pretty) {
            html += this._mkIndent(this._depth);
            this._depth++;
        }
        const pairTag = (children || tag === "script");
        html += "<" + tag + (args ? " " + args : "") + (pairTag ? ">" : "/>");
        if (this._pretty) {
            html += "\n";
        }
        this._onHtml(html);
        return false;
    }

    close(tag: string, children: number, ctx?: any): void {
        let html = "";
        const pairTag = (children || tag === "script");
        if (this._pretty) {
            this._depth--;
            if (pairTag) {
                html += this._mkIndent(this._depth);
            }
        }
        if (pairTag) {
            html += "</" + tag + ">";
            if (this._pretty) {
                html += "\n";
            }
            this._onHtml(html);
        }
    }

    text(text: string, ctx?: any): void {
        let html = "";
        if (this._pretty) {
            html += this._mkIndent(this._depth);
        }
        html += text;
        if (this._pretty) {
            html += "\n";
        }
        this._onHtml(html);
    }

    fnc(fnc: JsonMLFnc, ctx?: any): void {
    }

    obj(obj: JsonMLObj, ctx?: any): void {
        if ("toJsonML" in obj) {
            jsonml(obj.toJsonML(), this, obj);
        } else {
            this.text("" + obj, ctx);
        }
    }

    private _mkIndent(count: number): string {
        let indent = "";
        for (let i = 0; i < count; i++) {
            indent += this._indent;
        }
        return indent;
    }

}

export function jsonml2html(jsonML: JsonML, onHtml: (html: string) => void, pretty = false): void {
    const handler = new JsonmlHtmlHandler(onHtml, pretty);
    jsonml(jsonML, handler);
}

export function jsonmls2html(jsonMLs: JsonMLs, onHtml: (html: string) => void, pretty = false): void {
    for (const jml of jsonMLs) {
        if (jml.constructor === String) {
            onHtml(jml + (pretty ? "\n" : ""));
        } else if ("toJsonML" in (jml as any)) {
            const obj = jml as JsonMLObj;
            jsonml2html(obj.toJsonML(), onHtml, pretty);
        } else {
            jsonml2html(jml as JsonML, onHtml, pretty);
        }
    }
}

export function jsonml2htmls(jsonML: JsonML, pretty = false): string[] {
    const htmls: string[] = [];
    jsonml2html(jsonML, html => htmls.push(html), pretty);
    return htmls;
}

export function jsonmls2htmls(jsonMLs: JsonMLs, pretty = false): string[] {
    const htmls: string[] = [];
    jsonmls2html(jsonMLs, html => htmls.push(html), pretty);
    return htmls;
}


class JsonmlDomHandler implements JsonMLHandler {

    element: HTMLElement;

    private _current: HTMLElement;

    open(tag: string, attrs: Attrs, children: number, ctx?: any): boolean {
        const e = document.createElement(tag);
        let id: string = attrs._id;
        let classes: string[] = attrs._classes ? attrs._classes : [];
        for (const a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                switch (a) {
                    case "_id":
                    case "_classes":
                    case "_ref":
                    case "_key":
                    case "_skip":
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


declare var IncrementalDOM: any;

class JsonmlIDomHandler implements JsonMLHandler {

    open(tag: string, attrs: Attrs, children: number, ctx?: any): boolean {
        const props: any = [];
        let id: string = attrs._id;
        let classes: string[] = attrs._classes ? attrs._classes : [];
        let ref: string = attrs._ref;
        for (const a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                switch (a) {
                    case "_id":
                    case "_classes":
                    case "_ref":
                    case "_key":
                    case "_skip":
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
                                    props.push("data-" + d, attrs[a][d]);
                                } else {
                                    props.push("data-" + d, JSON.stringify(attrs[a][d]));
                                }
                            }
                        }
                        break;
                    case "styles":
                        props.push("style", attrs[a]);
                        break;
                    default:
                        if (typeof attrs[a] === "function") {
                            props.push("on" + a, attrs[a]);
                        } else {
                            props.push(a, attrs[a]);
                        }
                }
            }
        }
        if (classes.length) {
            props.unshift("class", classes.join(" "));
        }
        if (id) {
            props.unshift("id", id);
        }
        IncrementalDOM.elementOpen(tag, attrs._key || null, null, ...props);
        if (attrs._skip) {
            IncrementalDOM.skip();
        }
        if (ctx && ref) {
            ctx.refs[ref] = IncrementalDOM.currentElement();
        }
        return attrs._skip ? true : false;
    }

    close(tag: string, children: number, ctx?: any): void {
        IncrementalDOM.elementClose(tag);
    }

    text(text: string, ctx?: any): void {
        IncrementalDOM.text(text);
    }

    fnc(fnc: JsonMLFnc, ctx?: any): void {
        fnc(IncrementalDOM.currentElement());
    }

    obj(obj: JsonMLObj, ctx?: any): void {
        if ("toJsonML" in obj) {
            jsonml(obj.toJsonML(), this, obj);
        } else {
            this.text("" + obj, ctx);
        }
    }

}

function jsonml2idom(jsonML: JsonML, ctx?: any): void {
    jsonml(jsonML, new JsonmlIDomHandler(), ctx);
}


function jsonmls2idom(jsonMLs: JsonMLs, ctx?: any): void {
    for (const jsonML of jsonMLs) {
        if (jsonML.constructor === String) {
            IncrementalDOM.text(jsonML);
        } else if ("toJsonML" in (jsonML as any)) {
            const obj = jsonML as JsonMLObj;
            jsonml2idom(obj.toJsonML(), obj);
        } else {
            jsonml2idom(jsonML as JsonML, ctx);
        }
    }
}


export function jsonml2idomPatch(node: Node, jsonML: JsonML, ctx?: any): void {
    IncrementalDOM.patch(node,
        (data: JsonML) => jsonml2idom(data, ctx), jsonML);
}

export function jsonmls2idomPatch(node: Node, jsonMLs: JsonMLs, ctx?: any): void {
    IncrementalDOM.patch(node,
        (data: JsonMLs) => jsonmls2idom(data, ctx), jsonMLs);
}
