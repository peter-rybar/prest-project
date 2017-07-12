
import { JsonMLObj, JsonMLs, JsonML, jsonmls2idomPatch } from "./jsonml";


export interface DomWidget {
    domAttach?(): void;
    domDetach?(): void;
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

    mount(e: HTMLElement): this {
        if (!this.dom) {
            (this as any).dom = e;
            const jsonMLs = (this as any).render();
            jsonmls2idomPatch(e, jsonMLs, this);
            if ((this as any).domAttach) {
                (this as any).domAttach();
            }
            // onDetach(e, () => {
            //     (this as any).dom = undefined;
            //     if ((this as any).domDetach) {
            //         (this as any).domDetach();
            //     }
            // });
        }
        return this;
    }

    umount(): this {
        if (this.dom) {
            if ((this as any).domDetach) {
                (this as any).domDetach();
            }
            this.dom.parentElement.removeChild(this.dom);
            (this as any).dom = undefined;
        }
        return this;
    }

    update(): this {
        const e = this.dom;
        if (e && !this._updateSched) {
            this._updateSched = setTimeout(() => {
                jsonmls2idomPatch(e, this.render(), this);
                this._updateSched = null;
            }, 0);
        }
        return this;
    }

    toJsonML(): JsonML {
        const jsonMLs = (this as any).render();
        return [this.type, { _id: this.id, _key: this.id },
            ...jsonMLs,
            (e: HTMLElement) => {
                if (!this.dom) {
                    (this as any).dom = e;
                    if ((this as any).domAttach) {
                        (this as any).domAttach();
                    }
                    // onDetach(e, () => {
                    //     (this as any).dom = undefined;
                    //     if ((this as any).domDetach) {
                    //         (this as any).domDetach();
                    //     }
                    // });
                }
            }
        ];
    }

}

// function onDetach(e: HTMLElement, callback: () => void) {
//     new MutationObserver(mutations => {
//         mutations.forEach(mutation => {
//             const removed = mutation.removedNodes as any;
//             for (const r of removed) {
//                 console.log(r, r === e);
//                 if (r === e) {
//                     callback();
//                 }
//             }
//         });
//     }).observe(e.parentElement, { childList: true });
//     // }).observe(e.parentElement, { childList: true, subtree: true });
// }


// const observer = new MutationObserver(mutations => {
//     mutations.forEach(mutation => {
//         // console.log(mutation.type);
//         // console.log(mutation.target);
//         // console.log("add", mutation.addedNodes);
//         // console.log("rm", mutation.removedNodes);
//         const added = mutation.addedNodes as any;
//         for (const a of added) {
//             console.log("added", a);
//         }
//         const removed = mutation.removedNodes as any;
//         for (const r of removed) {
//             console.log("removed", r);
//         }
//     });
// });
// const config = {
//     childList: true,
//     // attributes: true,
//     // characterData: true,
//     // subtree: true,
//     // attributeOldValue: true,
//     // characterDataOldValue: true,
//     attributeFilter: [] as string[]
// };
// observer.observe(document.getElementById("app"), config);
// // observer.disconnect();
