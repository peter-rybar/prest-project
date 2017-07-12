export class UrlEncodedData {

    static encode(data: any, prefix = ""): string {
        let str: string;
        if (typeof data !== "object") {
            str = data;
        } else {
            const params: string[] = [];
            let size = 0;
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    let value = data[key];
                    if (!(value instanceof Array)) {
                        value = [value];
                    }
                    const valueLength = value.length;
                    for (let i = 0; i < valueLength; i++) {
                        const val = value[i];
                        if ((typeof val === "object") && (val != null)) {
                            params[size++] = arguments.callee(val, prefix + key + ".");
                        } else { // list
                            params[size] = encodeURIComponent(prefix + key);
                            if (val != null) {
                                params[size] += "=" + encodeURIComponent(val);
                            }
                            size++;
                        }
                    }
                }
            }
            str = params.join("&");
        }
        return str;
    }

    static decode(str: string): any {
        const data: any = {};
        if (str) {
            const params = str.split("&");
            const paramsLength = params.length;
            for (let j = 0; j < paramsLength; j++) {
                const parameter = params[j].split("=");
                const key = decodeURIComponent(parameter[0]);
                if (parameter.length > 1) {
                    const value = decodeURIComponent(parameter[1]);
                    const path = key.split(".");
                    const size = path.length;
                    let obj = data;
                    for (let i = 0; i < size; i++) {
                        const property = path[i];
                        const o = obj[property];
                        if (i === (size - 1)) { // list
                            if (!o) {
                                obj[property] = value;
                            } else if (o instanceof Array) {
                                obj[property].push(value);
                            } else { // create array
                                obj[property] = [o];
                                obj[property][1] = value;
                            }
                        } else {
                            if (!o) {
                                obj[property] = {};
                            }
                            obj = obj[property];
                        }
                    }
                } else {
                    data[key] = null;
                }
            }
        }
        return data;
    }

}

export class Base64 {

    private static _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    static encode(e: string): string {
        let t = "";
        let n: any, r: any, i: any, s: any, o: any, u: any, a: any;
        let f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64;
            } else if (isNaN(i)) {
                a = 64;
            }
            t = t + Base64._keyStr.charAt(s) + Base64._keyStr.charAt(o) + Base64._keyStr.charAt(u) + Base64._keyStr.charAt(a);
        }
        return t;
    }

    static decode(e: string): string {
        let t = "";
        let n: any, r: any, i: any;
        let s: any, o: any, u: any, a: any;
        let f = 0;
        e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (f < e.length) {
            s = this._keyStr.indexOf(e.charAt(f++));
            o = this._keyStr.indexOf(e.charAt(f++));
            u = this._keyStr.indexOf(e.charAt(f++));
            a = this._keyStr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u !== 64) {
                t = t + String.fromCharCode(r);
            }
            if (a !== 64) {
                t = t + String.fromCharCode(i);
            }
        }
        t = Base64._utf8_decode(t);
        return t;
    }

    private static _utf8_encode(e: string): string {
        e = e.replace(/\r\n/g, "\n");
        let t = "";
        for (let n = 0; n < e.length; n++) {
            const r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128);
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128);
            }
        }
        return t;
    }

    private static _utf8_decode(e: string): string {
        let t = "";
        let n = 0;
        let r = 0;
        let c1 = 0;
        let c2 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++;
            } else if (r > 191 && r < 224) {
                c1 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c1 & 63);
                n += 2;
            } else {
                c1 = e.charCodeAt(n + 1);
                c2 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c1 & 63) << 6 | c2 & 63);
                n += 3;
            }
        }
        return t;
    }
}
