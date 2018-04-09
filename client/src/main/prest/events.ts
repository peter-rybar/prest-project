
export class Events<C> {

    private _ctx: C;
    private _cbs: { [e: string]: Array<(data: any, ctx: C, e: string) => void> };
    private _cb: Array<(data: any, ctx: C, e: string) => void>;

    constructor(ctx?: C) {
        this._cbs = {};
        this._ctx = ctx;
    }

    on(e: string, cb: (data: any, ctx: C, e: string) => void): this {
        if (!e) {
            if (!this._cb) {
                this._cb = [];
            }
            this._cb.push(cb);
        }
        if (!(e in this._cbs)) {
            this._cbs[e] = [];
        }
        if (this._cbs[e].indexOf(cb) === -1) {
            this._cbs[e].push(cb);
        }
        return this;
    }

    once(e: string, cb: (data: any, ctx: C, e: string) => void): this {
        const wrap = (d: any, c: C, ev: string) => {
            this.off(e, wrap);
            cb(d, c, ev);
        };
        this.on(e, wrap);
        return this;
    }

    off(e: string, cb?: (data: any, ctx: C, e: string) => void): this {
        if (!e) {
            if (cb) {
                this._cb.splice(this._cbs[e].indexOf(cb), 1);
            } else {
                this._cb.length = 0;
                delete this._cb;
            }
        }
        if (e in this._cbs) {
            if (cb) {
                this._cbs[e].splice(this._cbs[e].indexOf(cb), 1);
            } else {
                this._cbs[e].length = 0;
                delete this._cbs[e];
            }
        }
        return this;
    }

    emit(e: string, data?: any): this {
        if (this._cb) {
            for (let i = 0, l = this._cb.length; i < l; i++) {
                this._cb[i](data, this._ctx, e);
            }
        }
        if (e in this._cbs) {
            for (let i = 0, l = this._cbs[e].length; i < l; i++) {
                this._cbs[e][i](data, this._ctx, e);
            }
        }
        return this;
    }

}

// const es = new Events<number>(3);

// es.on(undefined, (data, ctx, e) => console.log("on all:", data, ctx, e));

// es.emit("e", "eee1");
// es.on("e", (data, ctx, e) => console.log(data, ctx, e));
// es.emit("e", "eee2");
// es.off("e");
// es.emit("e", "eee3");

// es.off(undefined);

// es.once(undefined, (data, ctx, e) => console.log("once all:", data, ctx, e));

// es.emit("o", "ooo1");
// es.once("o", (data, ctx, e) => console.log(data, ctx, e));
// es.emit("o", "ooo2");
// es.emit("o", "ooo3");
