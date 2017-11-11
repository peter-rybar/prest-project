
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
