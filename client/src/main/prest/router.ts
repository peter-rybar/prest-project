// implemented based on https://github.com/mench/hash-router/

type Path = string | RegExp | Array<string>;
type Keys = { name: string, optional: boolean }[];

export class Emitter {

    private _callbacks: { [key: string]: Function[] } = {};

    on(event: string, fn: Function): this {
        if (!(event in this._callbacks)) {
            this._callbacks[event] = [];
        }
        this._callbacks[event].push(fn);
        return this;
    }

    emit(event: string, ...args: any[]): this {
        if (event in this._callbacks) {
            this._callbacks[event].forEach(cb => cb.apply(this, args));
        }
        return this;
    }

    off(event: string, fn?: Function) {
        if (!this._callbacks || arguments.length === 0) {
            this._callbacks = {};
            return this;
        }
        const callbacks = this._callbacks[event];
        if (!callbacks) {
            return this;
        }
        if (arguments.length === 1) {
            delete this._callbacks[event];
            return this;
        }
        for (let i = 0; i < callbacks.length; i++) {
            const callback = callbacks[i];
            if (callback === fn) {
                callbacks.splice(i, 1);
                break;
            }
        }
        return this;
    }
}

export class Route {

    private _pathParse(path: Path, sensitive: boolean, strict: boolean): void {
        if (path instanceof RegExp) {
            this._regex = path;
            return;
        }
        if (path instanceof Array) {
            path = "(" + path.join("|") + ")";
        }
        path = path
            .concat(strict ? "" : "/?")
            .replace(/\/\(/g, "(?:/")
            .replace(/\+/g, "__plus__")
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g,
                (_: any, slash: string, format: string, key: string,
                 capture: boolean, optional: boolean) => {
                    this.keys.push({ name: key, optional: !!optional });
                    slash = slash || "";
                    return (
                        "" +
                        (optional ? "" : slash) +
                        "(?:" +
                        (optional ? slash : "") +
                        (format || "") +
                        (capture || ((format && "([^/.]+?)") || "([^/]+?)")) +
                        ")" +
                        (optional || "")
                    );
                })
            .replace(/([\/.])/g, "\\$1")
            .replace(/__plus__/g, "(.+)")
            .replace(/\*/g, "(.*)");
        this._regex = new RegExp("^" + path + "$", sensitive ? "" : "i");
    }

    private _regex: RegExp;
    private _params: any = {};

    readonly path: string;
    readonly keys: Keys = [];

    constructor(path: string) {
        this.path = path;
        this._pathParse(path, false, false);
    }

    match(path: string, params: string[]) {
        const m = this._regex.exec(path);
        if (!m) {
            return false;
        }
        for (let i = 1; i < m.length; ++i) {
            const key = this.keys[i - 1];
            const val = "string" === typeof m[i] ? decodeURIComponent(m[i]) : m[i];
            if (key) {
                this._params[key.name] = val;
            }
            params.push(val);
        }
        return true;
    }

}

export class Router extends Emitter {

    public static default: Router = new Router();

    static getHash(): string {
        return window.location.hash.substring(1);
    }

    static start(): void {
        Router.default.emit("start");
    }

    static route(path: string, handler: Function): void {
        Router.default.register(path, handler);
    }

    static navigate(path: string): void {
        window.location.hash = path;
    }

    private _routes: Route[] = [];

    constructor() {
        super();
        if (window.addEventListener) {
            window.addEventListener("hashchange", this._onHashChange, false);
        } else {
            (window as any).attachEvent("onhashchange", this._onHashChange);
        }
        this.on("start", this._onHashChange);
    }

    public register(path: string, handler: Function): void {
        const route = new Route(path);
        this._routes.push(route);
        this.on(path, (params: any, route: any) => {
            return handler.apply(route, params);
        });
    }

    public handle(url: string) {
        for (const route of this._routes) {
            const params: string[] = [];
            if (route.match(url, params)) {
                this.emit(route.path, params, route);
                break;
            }
        }
    }

    private _onHashChange = () => {
        this.handle(Router.getHash());
    }

}

export function route(path: string, handler: Function) {
    return Router.route(path, handler);
}
