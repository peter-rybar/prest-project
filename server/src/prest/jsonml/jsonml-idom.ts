
import {
    JsonML,
    JsonMLs,
    JsonMLObj,
    JsonMLFnc,
    Attrs,
    JsonMLHandler,
    jsonml
} from "./jsonml";


declare var IncrementalDOM: any;


class JsonmlIDomHandler implements JsonMLHandler {

    open(tag: string, attrs: Attrs, children: number, ctx?: any): boolean {
        const props: any[] = [];
        let id: string = attrs._id;
        let classes: string[] = attrs._classes ? attrs._classes : [];
        let ref: string = attrs._ref;
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
        if (widget && "mount" in widget && widget.mount.constructor === Function) {
            widget.mount(IncrementalDOM.currentElement());
            IncrementalDOM.skip();
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
