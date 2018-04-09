export class Hash<T> {

    private _listenIntervalId: any;

    private _encoder = (data: T) => JSON.stringify(data);

    private _decoder = (data: string) => data === "" ? JSON.parse(data) : undefined;

    /**
     * Listen on URL hash fragment changes
     */
    onChange(callback: (data: T) => void): this {
        if ("onhashchange" in window) {
            onhashchange = () => {
                callback(this.read());
            };
        } else {
            // prest.log.warning('browser "window.onhashchange" not implemented, running emulation');
            let prevHash = location.hash;
            if (this._listenIntervalId) {
                clearInterval(this._listenIntervalId);
            }
            this._listenIntervalId = setInterval(() => {
                if (location.hash !== prevHash) {
                    prevHash = location.hash;
                    callback(this.read());
                }
            }, 500);
        }
        return this;
    }

    setEncoder(encoder: (data: T) => string): this {
        this._encoder = encoder;
        return this;
    }

    setDecoder(decoder: (data: string) => T): this {
        this._decoder = decoder;
        return this;
    }

    /**
     * Returns decoded window.location.hash data
     */
    read(): T {
        const str = location.hash.slice(1);
        return this._decoder(str);
    }

    /**
     * Encode data and sets window.location.hash fragment
     */
    write(hashData: T) {
        const str = this._encoder(hashData);
        location.hash = "#" + str;
    }

}
