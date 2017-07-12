
function is_array(obj: any) {
    return Array.isArray ?
        Array.isArray(obj) :
        (obj == null || obj === undefined || "boolean|number|string|function|xml".indexOf(typeof obj) !== -1 ) ?
            false :
            (typeof obj.length === "number" && !(obj.propertyIsEnumerable("length")));
}


export function decodeUrlQuery(queryStr: string): { [key: string]: string } {
    const query: { [key: string]: string } = {};
    if (queryStr) {
        const a = queryStr.substr(1).split("&");
        for (let i = 0, l = a.length; i < l; i++) {
            const b = a[i].split("=");
            query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || "");
        }
    }
    return query;
}

export function encodeUrlQuery(query: any): string {
    const key_value_pairs: any = [];

    for (const key in query) {
        if (query.hasOwnProperty(key)) {
            const value = query[key];
            if (typeof value === "object") {
                if (is_array(value)) {
                    for (let j = 0, l = value.length; j < l; j++) {
                        key_value_pairs.push(
                            [key, typeof value[j] === "object" ?
                                JSON.stringify(value[j]) : value[j]]);
                    }

                } else {
                    key_value_pairs.push([key, JSON.stringify(value)]);
                }
            } else {
                key_value_pairs.push([key, value]);
            }
        }
    }

    for (let j = 0, pair: any; pair = key_value_pairs[j++]; ) {
        key_value_pairs[j - 1] = "" +
            encodeURIComponent(pair[0]) + "=" + encodeURIComponent(pair[1]);
    }

    return key_value_pairs.join("&");
}


export class HttpResponse {

    private _xhr: XMLHttpRequest;

    constructor(xhr: XMLHttpRequest) {
        this._xhr = xhr;
    }

    getHeaders(): string {
        return this._xhr.getAllResponseHeaders();
    }

    getHeader(header: string): string {
        return this._xhr.getResponseHeader(header);
    }

    getBody(): any {
        return this._xhr.response;
    }

    getType(): string {
        return this._xhr.responseType;
    }

    getContentType(): string {
        return this.getHeader("Content-Type");
    }

    getText(): string {
        return this._xhr.responseText;
    }

    getJson(): any {
        return JSON.parse(this._xhr.responseText);
    }

    getXml(): Document {
        return this._xhr.responseXML;
    }

}


export interface HttpProgress {
    loaded: number;
    total: number;
}

export type Method = "GET" | "POST" | "PUT" | "DELETE" |
        "HEAD" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";

export type ResponseType = "arraybuffer" | "blob" | "document" | "json" | "text";

export class HttpRequest {

    private _url: string;
    private _query: Object;
    private _method: Method = "GET";
    private _headers: {[key: string]: string} = {};
    private _timeout: number;
    private _responseType: ResponseType;

    private _onProgress: (progress: HttpProgress) => void;
    private _onResponse: (response: HttpResponse) => void;
    private _onError: (e: Event) => void;

    private _xhr: XMLHttpRequest;
    private _async: boolean = true;
    private _noCache: boolean = false;

    constructor() {
    }

    get(url: string, query?: Object): this {
        this.method("GET");
        this.url(url, query);
        return this;
    }

    post(url: string, query?: Object): this {
        this.method("POST");
        this.url(url, query);
        return this;
    }

    put(url: string, query?: Object): this {
        this.method("PUT");
        this.url(url, query);
        return this;
    }

    del(url: string, query?: Object): this {
        this.method("DELETE");
        this.url(url, query);
        return this;
    }

    url(url: string, query?: Object): this {
        this._url = url;
        this._query = query;
        return this;
    }

    method(method: Method): this {
        this._method = method;
        return this;
    }

    headers(headers: {[key: string]: string}): this {
        for (const key in headers) {
            if (headers.hasOwnProperty(key)) {
                this._headers[key] = headers[key];
            }
        }
        return this;
    }

    auth(login: string, password: string): this {
        this._headers["Authorization"] = "Basic " + btoa(login + ":" + password);
        return this;
    }

    timeout(timeout: number): this {
        this._timeout = timeout;
        return this;
    }

    responseType(type: ResponseType): this {
        this._responseType = type;
        return this;
    }

    onProgress(onProgress: (progress: HttpProgress) => void): this {
        this._onProgress = onProgress;
        return this;
    }

    onResponse(onResponse: (response: HttpResponse) => void): this {
        this._onResponse = onResponse;
        return this;
    }

    onError(onError: (e: Event) => void): this {
        this._onError = onError;
        return this;
    }

    async(async: boolean): this {
        this._async = async;
        return this;
    }

    noCache(noCache: boolean = true): this {
        this._noCache = noCache;
        return this;
    }

    abort(): this {
        if (this._xhr) {
            this._xhr.abort();
        }
        return this;
    }

    send(data?: any, contentType?: string): void {
        if (contentType) {
            this._headers["Content-Type"] = contentType;
        }
        this._send(data, this._headers);
    }

    private _send(data?: any, headers?: {[key: string]: string}): void {
        const xhr = new XMLHttpRequest();
        this._xhr = xhr;

        let url = this._url;
        if (this._query) {
            const query = encodeUrlQuery(this._query);
            url = query ? (url + "?" + query) : url;
        }
        if (this._noCache) {
            url += ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime();
        }
        // console.debug("HttpRequest: " + this._method + " " + url, data);

        if (this._responseType) {
            this._xhr.responseType = this._responseType;
        }

        if ("onprogress" in xhr) {
            if (this._onProgress) {
                const onprogress = (e: ProgressEvent) => {
                    if (e.lengthComputable) {
                        this._onProgress({loaded: e.loaded, total: e.total});
                    }
                };
                xhr.upload.onprogress = onprogress;
                xhr.onprogress = onprogress;
            }
        }

        xhr.open(this._method, url, this._async);

        for (const header in headers) {
            if (headers.hasOwnProperty(header)) {
                xhr.setRequestHeader(header, headers[header]);
            }
        }

        if (this._timeout) {
            xhr.timeout = this._timeout;
        }

        if ("ontimeout" in xhr) {
            if (this._onError) {
                xhr.ontimeout = (e: Event) => {
                    this._onError(e);
                };
            }
        }

        if ("onabort" in xhr) {
            if (this._onError) {
                xhr.onabort = () => {
                    this._onError(undefined);
                };
            }
        }

        if (this._async) {
            xhr.onreadystatechange = (e: Event) => {
                switch (xhr.readyState) {
                    // case 3: // loading
                    //    if (this._onProgress) {
                    //        this._onProgress(new HttpResponse(httpRequest));
                    //    }
                    //    break;
                    case 4: // done
                        if (
                            (xhr.status >= 200 && xhr.status < 300) ||
                            (xhr.status === 0 && !this._url.match(/^https?:\/\//)) // schemes other than http (file, ftp)
                        ) {
                            if (this._onResponse) {
                                this._onResponse(new HttpResponse(xhr));
                            }
                        } else {
                            if (this._onError) {
                                this._onError(e);
                            }
                        }
                        break;
                }
            };

            if (data !== undefined) {
                if ((typeof data === "string") || (data instanceof FormData) || (data instanceof Blob)) {
                    xhr.send(data);
                } else {
                    if (!this._headers["Content-Type"]) {
                        xhr.setRequestHeader("Content-Type", "application/json");
                    }
                    xhr.send(JSON.stringify(data));
                }
            } else {
                xhr.send();
            }
        } else {
            if (this._onError) {
                xhr.onerror = (e: ErrorEvent) => {
                    this._onError(e);
                };
            }
            if (data) {
                const payload = (typeof data === "string") ? data : JSON.stringify(data);
                xhr.send(payload);
            } else {
                xhr.send();
            }
            return JSON.parse(xhr.responseText);
        }
    }

}


export const http = {

    get: function (url: string, query?: Object): HttpRequest {
        return new HttpRequest().method("GET").url(url, query);
    },

    post(url: string, query?: Object): HttpRequest {
        return new HttpRequest().method("POST").url(url, query);
    },

    put(url: string, query?: Object): HttpRequest {
        return new HttpRequest().method("PUT").url(url, query);
    },

    del(url: string, query?: Object): HttpRequest {
        return new HttpRequest().method("DELETE").url(url, query);
    }

};
