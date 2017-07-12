
import { http } from "./prest/http";
import { Signal } from "./prest/signal";
import { JsonMLs } from "./prest/jsonml";
import { Widget } from "./prest/jsonml-widget";

export const version: string = "@VERSION@";


window.onerror = function (message, source, lineno, colno, error) {
    http.post("jserr")
        .send({
            source: source,
            message: message,
            lineno: lineno,
            colno: colno,
            error: error,
            error_stack: (<any>error).stack
        });
};


interface User {
    login: string;
    name: number;
    role: string;
}

interface Product {
    code: string;
    title: string;
    description: string;
    price: number;
    count: number;
    sold: number;
}

interface OrderItem {
    count: number;
    product: Product;
}

interface Order {
    items: OrderItem[];
    count: number;
    price: number;
    timestamp?: string;
}


class MenuWidget extends Widget {

    private _user: User;

    readonly sigLogin = new Signal<void>();

    constructor() {
        super();
    }

    setUser(user: User): this {
        this._user = user;
        return this;
    }

    onSigLogin(slot: () => void): this {
        this.sigLogin.connect(slot);
        return this;
    }

    render(): JsonMLs {
        return [
            ["div.ui.segment.basic",
                ["div.ui.secondary.pointing.menu",
                    ["a.item.active", "Bufet"],
                    ["a.item", { href: "#order" }, "Nákupný Košík"],
                    ["a.item", { href: "#orders" }, "Objednávky"],
                    ["div.right.menu",
                        ["a.ui.item",
                            ["span", { click: (e: Event) => this.sigLogin.emit() },
                                this._user ?
                                    ["span", { title: `login: ${this._user.login}` },
                                        this._user.name + (this._user.role === "admin" ? " (admin)" : "")
                                    ] :
                                    ["span", { id: "login" }, "Login"]
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }

}


class ProductsWidget extends Widget {

    private _products: Product[] = [];

    readonly sigOrderItem = new Signal<OrderItem>();

    setProducts(products: Product[]): this {
        this._products = products;
        this.update();
        return this;
    }

    onSigOrderItem(slot: (o: OrderItem) => void): this {
        this.sigOrderItem.connect(slot);
        return this;
    }

    render(): JsonMLs {
        return [
            ["div.products.ui.cards",
                ...this._products.map(product => {
                    return (
                        ["div.product.card", { title: `code: ${product.code}` },
                            // ["div.image", ["img", {src: "img.jpg"}]],
                            ["div.content",
                                ["div.header", product.title, " "],
                                // ["div.meta", "novinka"],
                                ["div.description", product.description]
                            ],
                            ["div.extra",
                                ["strong.price", product.price.toFixed(2), "€ "],
                                ["span.count.right.floated", "" + product.count, " na sklade"]
                            ],
                            ["div.ui.bottom.attached.button",
                                {
                                    click: () => this.sigOrderItem.emit({
                                        product: product,
                                        count: 1
                                    })
                                },
                                ["i.icon.add.to.cart"],
                                "Do košíka"
                            ]
                        ]
                    );
                })
            ]
        ];
    }

}


class OrderWidget extends Widget {

    private _orderItems: OrderItem[] = [];
    private _message: string;
    private _messageType: "info" | "error";

    readonly sigOrder = new Signal<Order>();

    setMessage(message = "", type: "info" | "error" = "info"): this {
        this._message = message;
        this._messageType = type;
        return this;
    }

    empty(): this {
        this._orderItems.length = 0;
        return this;
    }

    add(orderItem: OrderItem): this {
        const found = this._orderItems
            .filter(o => o.product.code === orderItem.product.code);
        if (found.length) {
            found[0].count++;
        } else {
            this._orderItems.push(orderItem);
        }
        return this;
    }

    remove(orderItem: OrderItem): this {
        const found = this._orderItems
            .filter(o => o.product.code === orderItem.product.code);
        if (found.length) {
            if (found[0].count > 1) {
                found[0].count--;
            } else {
                this._orderItems = this._orderItems
                    .filter(o => o.product.code !== orderItem.product.code);
            }
        }
        return this;
    }

    onSigOrder(slot: (o: Order) => void): this {
        this.sigOrder.connect(slot);
        return this;
    }

    render(): JsonMLs {
        const price = this._orderItems.reduce(
            (sum, order) => sum + order.product.price * order.count,
            0);
        const count = this._orderItems.reduce(
            (count, order) => count + order.count,
            0);
        return [
            ["table.orders.ui.table.selectable.compact",
                ["thead",
                    ["tr",
                        ["th", "Produkt"],
                        ["th", "Jedn. Cena"],
                        ["th.center.aligned", "Počet"],
                        ["th.center.aligned", "Cena"],
                        ["th"]
                    ]
                ],
                ["tbody",
                    ...this._orderItems.map(orderItem => {
                        return (
                            ["tr.order", { title: `code: ${orderItem.product.code}` },
                                ["td", orderItem.product.title],
                                ["td", orderItem.product.price.toFixed(2), "€"],
                                ["td.center.aligned", "" + orderItem.count],
                                ["td.right.aligned", (orderItem.product.price * orderItem.count).toFixed(2), "€"],
                                ["td.center.aligned",
                                    ["button.ui.button.icon.tiny",
                                        { click: () => this.remove(orderItem).update() },
                                        ["i.icon.minus"]
                                    ],
                                    ["button.ui.button.icon.tiny",
                                        { click: () => this.add(orderItem).update() },
                                        ["i.icon.plus"]
                                    ]
                                ]
                            ]
                        );
                    })
                ],
                ["tfoot.full-width",
                    ["tr",
                        ["th", { colspan: 2 }],
                        ["th.center.aligned", ["strong", "" + count]],
                        ["th.right.aligned", ["strong", price.toFixed(2)], "€"],
                        ["th.center.aligned",
                            ["button.order.ui.button" + (price ? "" : ".disabled"),
                                {
                                    click: (e: Event) => {
                                        (e.target as Element).classList.add("loading");
                                        this.sigOrder.emit(
                                            {
                                                items: this._orderItems,
                                                count: count,
                                                price: +price.toFixed(2)
                                            });
                                    }
                                },
                                // ["i.icon.send"],
                                "Objednať"]
                        ]
                    ]
                ]
            ],
            (this._message ?
                ["div.ui.message." + this._messageType,
                    ["i.close.icon", { click: () => this.setMessage().update() }],
                    ["div.header", this._message]
                    // ["p", "This is a special notification which you can dismiss if you're bored with it."]
                ] :
                [""])
        ];
    }

}


class OrdersStatsWidget extends Widget {

    private _orders: Order[] = [];

    setOrders(orders: Order[]): this {
        this._orders = orders;
        this.update();
        return this;
    }

    render(): JsonMLs {
        const orders = this._orders;
        const sum = orders.map(o => o.price).reduce((sum, price) => sum + price, 0);
        const count = orders.map(o => o.count).reduce((sum, count) => sum + count, 0);
        return [
            ["div.ui.statistics.small",
                ["div.statistic.blue",
                    ["div.value", "" + orders.length],
                    ["div.label", "Objednávky"]
                ],
                ["div.statistic.green",
                    ["div.value", "" + count],
                    ["div.label", "Produkty"]
                ],
                ["div.statistic.red",
                    ["div.value", sum.toFixed(2), "€"],
                    ["div.label", "Celková cena"]
                ]
            ]
        ];
    }

}


class OrdersWidget extends Widget {

    private _orders: Order[] = [];

    empty(): this {
        this._orders.length = 0;
        return this;
    }

    getOrders(): Order[] {
        return this._orders;
    }

    setOrders(orders: Order[]): this {
        this._orders = orders;
        return this;
    }

    render(): JsonMLs {
        return [
            ["table.orders.ui.table.selectable.compact",
                ["thead",
                    ["tr",
                        ["th", "Produkt"],
                        ["th", "Jedn. Cena"],
                        ["th.center.aligned", "Počet"],
                        ["th.center.aligned", "Cena"]
                    ]
                ],
                ...this._orders
                    .map(order => {
                        return [
                            ["tr.orders",
                                ["td", { colspan: 4 },
                                    ["strong", new Date(order.timestamp).toUTCString()]]
                            ],
                            ...order.items.map(orderItem => {
                                return (
                                    ["tr.order", { title: `code: ${orderItem.product.code}` },
                                        ["td", orderItem.product.title],
                                        ["td", orderItem.product.price.toFixed(2), "€"],
                                        ["td.center.aligned", "" + orderItem.count],
                                        ["td.right.aligned", (orderItem.product.price * orderItem.count).toFixed(2), "€"]
                                    ]
                                );
                            }),
                            ["tr.sumar",
                                ["td", { colspan: 2 }],
                                ["td.center.aligned", ["strong", "" + order.count]],
                                ["td.right.aligned", ["strong", order.price.toFixed(2)], "€"]
                            ]
                        ];
                    })
                    .reduce((a, i) => a.concat(i), [])
            ]
        ];
    }

}


class App extends Widget {

    private _menuWidget: MenuWidget;
    private _productsWidget: ProductsWidget;
    private _orderWidget: OrderWidget;
    private _ordersStatsWidget: OrdersStatsWidget;
    private _ordersWidget: OrdersWidget;

    private _user: User;

    readonly sigUser = new Signal<User>();

    constructor() {
        super();
        this._initMenu();
        this._initProducts();
        this._initOrder();
        this._initOrdersStat();
        this._initOrders();
    }

    render(): JsonMLs {
        return [
            ["div.ui.container",
                this._menuWidget
            ],
            ["div.ui.container",
                ["div.ui.basic.segment",
                    ["h1", "Produkty"],
                    this._productsWidget
                ]
            ],
            ["div.ui.container",
                ["div.ui.two.column.stackable.grid",
                    ["div.column",
                        ["div.ui.segment.basic",
                            ["h2", { id: "order" }, "Nákupný Košík"],
                            this._orderWidget
                        ]
                    ],
                    ["div.column",
                        ["div.ui.segment.basic",
                            ["h2", "Sumár"],
                            this._ordersStatsWidget
                        ]
                    ]
                ]
            ],
            ["div.ui.container",
                ["div.ui.segment.basic",
                    ["h2", { id: "orders" }, "Objednávky"],
                    this._ordersWidget
                ]
            ],
            ["div.ui.vertical.segment.footer",
                ["div.ui.container",
                    ["div.ui.segment.basic",
                        "Author: ",
                        ["a", { href: "http://prest-tech.appspot.com/peter-rybar" },
                            "Peter Rybár"
                        ],
                        " – Mail: ",
                        ["a", { href: "mailto:pr.rybar@gmail.com" },
                            "pr.rybar@gmail.com"
                        ]
                    ]
                ]
            ]
        ];
    }

    private _login(): void {
        http.get("/user")
            .onResponse(res => {
                const user = res.getJson().user as User;
                this._user = user;
                this.sigUser.emit(user);
            })
            .onError(err => console.error(err))
            .send();
    }

    private _initMenu(): void {
        this._menuWidget = new MenuWidget()
            .onSigLogin(() => this._login());
        this.sigUser.connect(user => this._menuWidget.setUser(user).update());
    }

    private _initProducts(): void {
        this._productsWidget = new ProductsWidget()
            .onSigOrderItem(order => {
                if (this._user) {
                    this._orderWidget.add(order).update();
                } else {
                    this._login();
                }
            });
        http.get("/products")
            .onResponse(res =>
                this._productsWidget.setProducts(res.getJson().products).update())
            .onError(err => console.error(err))
            .send();
    }

    private _updateOrdersStats(): void {
        http.get("/orders")
            .onResponse(res =>
                this._ordersStatsWidget.setOrders(res.getJson().orders).update())
            .onError(err => console.error(err))
            .send();
    }

    private _postOrder(order: Order): void {
        http.post("/order")
            .onResponse(res => {
                this._orderWidget.setMessage("Objednávka bola odoslaná").empty().update();
                this._updateOrdersStats();
                this._updateOrders();
            })
            .onError(err => {
                console.error(err);
                this._orderWidget
                    .setMessage("Chyba odoslania objednávky: " +
                        (err.currentTarget as XMLHttpRequest).status, "error")
                    .update();
            })
            .send(order);
    }

    private _initOrder(): void {
        this._orderWidget = new OrderWidget()
            .onSigOrder(order => this._postOrder(order));
        this.sigUser.connect(user => this._updateOrdersStats());
    }

    private _initOrdersStat(): void {
        this._ordersStatsWidget = new OrdersStatsWidget();
    }

    private _updateOrders(): void {
        http.get("/orders")
            .onResponse(res =>
                this._ordersWidget.setOrders(res.getJson().orders).update())
            .onError(err => console.error(err))
            .send();
    }

    private _initOrders(): void {
        this._ordersWidget = new OrdersWidget();
        this.sigUser.connect(user => this._updateOrders());
    }

}


new App().mount(document.getElementById("app"));
