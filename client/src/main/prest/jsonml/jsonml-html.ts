
import {
    JsonML,
    JsonMLs,
    JsonMLObj,
    JsonMLFnc,
    Attrs,
    JsonMLHandler,
    jsonml
} from "./jsonml";


class JsonmlHtmlHandler implements JsonMLHandler {

    private static _pairTags = [
        "script",
        "html", "head", "body", "title",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "a", "pre", "blockquote", "i", "b", "em", "strong", "tt", "cite",
        "ol", "ul", "li", "dl", "dt", "dd", "table", "tr", "td"];

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
        const pairTag = (children || JsonmlHtmlHandler._pairTags.indexOf(tag) !== -1);
        html += "<" + tag + (args ? " " + args : "") + (pairTag ? ">" : "/>");
        if (this._pretty) {
            html += "\n";
        }
        this._onHtml(html);
        return false;
    }

    close(tag: string, children: number, ctx?: any): void {
        let html = "";
        const pairTag = (children || JsonmlHtmlHandler._pairTags.indexOf(tag) !== -1);
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
