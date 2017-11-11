
import { remove, select, Widget, selectAll } from "../main/prest/dom";
import { jsonml2html } from "../main/prest/jsonml/jsonml-html";
import { jsonml2dom } from "../main/prest/jsonml/jsonml-dom";
import { jsonmls2idomPatch } from "../main/prest/jsonml/jsonml-idom";


class Item {
    constructor(public text: string,
                public count: number) {
    }
}

class MyWidget implements Widget {

    readonly name: string;

    private _items: Item[] = [];
    private _onSelect: (item: Item) => void;

    private _element: HTMLElement;

    constructor(name?: string) {
        this.name = name;
    }

    setItems(items: Item[]): this {
        this._items = items;
        this._update();
        return this;
    }

    getItems(): Item[] {
        return this._items;
    }

    addItem(item: Item): this {
        this._items.push(item);
        this._update();
        return this;
    }

    removeItem(item: Item): this {
        this._items = this._items.filter(i => i !== item);
        this._update();
        return this;
    }

    onSelect(callback: (item: Item) => void): this {
        this._onSelect = callback;
        return this;
    }

    mount(e: HTMLElement): this {
        this._element = e;
        this._update();
        return this;
    }

    umount(): this {
        remove(this._element);
        return this;
    }

    private _update(): void {
        if (this._element) {
            jsonmls2idomPatch(this._element, [
                ["form",
                    {
                        submit: (e: Event) => {
                            e.preventDefault();
                            // const form = (e.target as HTMLFormElement);
                            // const input = (select("input", form) as HTMLInputElement);
                            const input = (select("input", this._element) as HTMLInputElement);
                            console.log("submit", input.value);
                            if (input.value) {
                                this.addItem(new Item(input.value, this._items.length));
                                input.value = "";
                            }
                        }
                    },
                    ["input",
                        {
                            type: "text", name: "text",
                            input: (e: Event) => {
                                console.log("input", (e.target as HTMLInputElement).value);
                            },
                            change: (e: Event) => {
                                console.log("change", (e.target as HTMLInputElement).value);
                            }
                        }
                    ],
                    ["input", { type: "submit", value: "add" }]
                ],
                ["ol",
                    ...this._items.map(item => {
                        return (
                            ["li",
                                {
                                    click: (e: Event) => {
                                        e.stopPropagation();
                                        if (this._onSelect) {
                                            this._onSelect(item);
                                        }
                                    }
                                },
                                ["span.label", item.text], " ",
                                ["small.count", `[${item.count}]`]
                            ]
                        );
                    })
                ]
            ]);
        }
    }

}

new MyWidget()
    .setItems([
        new Item("text 1", 0),
        new Item("text 2", 1),
        new Item("text 3", 2)])
    .onSelect(item => {
        console.log("selected:", item);
        const selected = select("#selected") as HTMLSpanElement;
        selected.innerHTML = JSON.stringify(item);
    })
    .mount(select("#container"));


// renderers test

const jml = [
    "a#b.c1.c2",
    {
        _ref: "ref-root",
        _key: "key",
        _skip: false,
        href: "localhost",
        click: function (e: Event) {
            e.preventDefault();
            console.log(e);
        },
        data: { x: "x", y: "y", o: { a: "a" } },
        classes: ["c3"],
        styles: { color: "green", borderTop: "1px solid red" }
    },
    ["#x.y~ref-div", "div", (e: HTMLElement) => console.log("fnc div", e)],
    ["strong", "link"],
    " text",
    ["~ref-empty", "empty"],
    (e: HTMLElement) => console.log("fnc anchor", e)
];

jsonml2html(jml, html => console.log(html));

jsonml2html(jml, html => console.log(html), true);

const e = jsonml2dom(jml);
console.log(e);
document.body.appendChild(e);

console.log("refs", selectAll("[ref]", e));
