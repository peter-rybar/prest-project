
export function selectAll(selector: string, element?: HTMLElement): HTMLElement[] {
    const e = element || document;
    const qsa = e.querySelectorAll(selector);
    const a: HTMLElement[] = [];
    for (let i = 0; i < qsa.length; i++) {
        a.push(qsa[i] as HTMLElement);
    }
    return a;
}

export function select(selector: string, element?: HTMLElement): HTMLElement {
    const e = element || document;
    return e.querySelector(selector) as HTMLElement;
}

export function append(element: HTMLElement, ...elements: HTMLElement[]): void {
    elements.forEach(e => element.appendChild(e));
}

export function replace(oldElement: HTMLElement, newElement: HTMLElement): void {
    oldElement.parentElement.replaceChild(newElement, oldElement);
}

export function remove(element: HTMLElement): void {
    element.parentElement.removeChild(element);
}

export function empty(element: HTMLElement) {
    while (element.firstChild /*.hasChildNodes()*/) {
        element.removeChild(element.firstChild);
    }
}


export function html(html: string): HTMLElement {
    html = html.trim();
    // const t = document.createElement("template") as HTMLTemplateElement;
    // if ("content" in t) {
    //     t.innerHTML = html;
    //     return t.content.cloneNode(true) as HTMLElement;
    // } else {
    let wrapMap: any = {
        option: [1, "<select multiple='multiple'>", "</select>"],
        legend: [1, "<fieldset>", "</fieldset>"],
        area: [1, "<map>", "</map>"],
        param: [1, "<object>", "</object>"],
        thead: [1, "<table>", "</table>"],
        tr: [2, "<table><tbody>", "</tbody></table>"],
        col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
        td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        body: [0, "", ""],
        _default: [1, "<div>", "</div>"]
    };
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
    const match = /<\s*\w.*?>/g.exec(html);
    let el: HTMLElement = document.createElement("div");
    if (match != null) {
        const tag = match[0].replace(/</g, "").replace(/>/g, "").split(" ")[0];
        if (tag.toLowerCase() === "body") {
            const body = document.createElement("body");
            // keeping the attributes
            el.innerHTML = html.replace(/<body/g, "<div").replace(/<\/body>/g, "</div>");
            const attrs = (el.firstChild as Element).attributes;
            body.innerHTML = html;
            for (let i = 0; i < attrs.length; i++) {
                body.setAttribute(attrs[i].name, attrs[i].value);
            }
            return body;
        } else {
            const map = wrapMap[tag] || wrapMap._default;
            html = map[1] + html + map[2];
            el.innerHTML = html;
            // Descend through wrappers to the right content
            let j = map[0] + 1;
            while (j--) {
                el = el.lastChild as HTMLElement;
            }
        }
    } else {
        el.innerHTML = html;
        el = el.lastChild as HTMLElement;
    }
    return el;
    // }
}


if (!Element.prototype.matches) {
    Element.prototype.matches =
        (Element.prototype as any).matchesSelector ||
        (Element.prototype as any).mozMatchesSelector ||
        (Element.prototype as any).msMatchesSelector ||
        (Element.prototype as any).oMatchesSelector ||
        (Element.prototype as any).webkitMatchesSelector ||
        function(this: any, s: string) {
        const matches = (this.document || this.ownerDocument).querySelectorAll(s);
        let i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
    };
}

export function addEventListener(element: HTMLElement,
                                 selector: string,
                                 event: string,
                                 listener: (target: HTMLElement, evt: Event) => void,
                                 useCapture: boolean = false) {
    element.addEventListener(
        event,
        function (e: Event) {
            const evt: Event = e || window.event;
            const target = (evt.target || e.srcElement) as HTMLElement;
            if (target && target.matches(selector)) {
                listener(target, evt);
            }
        },
        useCapture);
}

export function removeEventListener(element: HTMLElement,
                                    event: string,
                                    listener: (evt: Event) => void,
                                    useCapture: boolean = false) {
    element.removeEventListener(event, listener, useCapture);
}


export interface Widget {
    mount(element: HTMLElement): this;
    umount(): this;
}
