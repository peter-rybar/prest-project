export class History<T> {

    back(distance?: number): void {
        (window.history as any).back(distance);
    }

    forward(distance?: number): void {
        (window.history as any).forward(distance);
    }

    go(delta?: number): void {
        window.history.go(delta);
    }

    length(): number {
        return window.history.length;
    }

    state(): T {
        return window.history.state as T;
    }

    pushState(state: T, title: string, url?: string): void {
        window.history.pushState(state, title, url);
    }

    replaceState(state: T, title: string, url?: string): void {
        window.history.replaceState(state, title, url);
    }

    onChange(callback: (state: T) => void): this {
        window.addEventListener("popstate", function (e: PopStateEvent) {
            callback(e.state);
        });
        return this;
    }

}
