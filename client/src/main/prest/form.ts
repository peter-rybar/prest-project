
export interface Entry {
    getName(): string;
    getValue(): string;
    setValue(value: string): this;
    validate(locale?: string): string;
    setValidator(validator: (entry: Entry, locale?: string) => string): this;
    onChange(callback: (entry: Entry) => void): this;
}


export class TextAreaEntry implements Entry {

    private _element: HTMLTextAreaElement;
    private _validator: (entry: Entry, locale: string) => string;
    private _onChange: (entry: Entry, final: boolean) => void;

    constructor(element: HTMLTextAreaElement | string) {
        if (typeof element === "string") {
            this._element = document.getElementById(element) as HTMLTextAreaElement;
        } else {
            this._element = element;
        }
        this._element.addEventListener("change", () => {
            if (this._onChange) {
                this._onChange(this, true);
            }
        });
        this._element.addEventListener("input", () => {
            if (this._onChange) {
                this._onChange(this, false);
            }
        });
    }

    getName(): string {
        return this._element.name;
    }

    getValue(): string {
        return this._element.value;
    }

    setValue(value: string): this {
        this._element.value = value;
        return this;
    }

    validate(locale?: string): string {
        if (this._validator) {
            return this._validator(this, locale);
        }
        return "";
    }

    setValidator(validator: (entry: Entry, locale?: string) => string): this {
        this._validator = validator;
        return this;
    }

    onChange(callback: (entry: Entry, final: boolean) => void): this {
        this._onChange = callback;
        return this;
    }

}


export class TextInputEntry implements Entry {

    private _element: HTMLInputElement;
    private _validator: (entry: Entry, locale: string) => string;
    private _onChange: (entry: Entry, final: boolean) => void;

    constructor(element: HTMLInputElement|string) {
        if (typeof element === "string") {
            this._element = document.getElementById(element) as HTMLInputElement;
        } else {
            this._element = element;
        }
        this._element.addEventListener("change", () => {
            if (this._onChange) {
                this._onChange(this, true);
            }
        });
        this._element.addEventListener("input", () => {
            if (this._onChange) {
                this._onChange(this, false);
            }
        });
    }

    getName(): string {
        return this._element.name;
    }

    getValue(): string {
        return this._element.value;
    }

    setValue(value: string): this {
        this._element.value = value;
        return this;
    }

    validate(locale?: string): string {
        if (this._validator) {
            return this._validator(this, locale);
        }
        return "";
    }

    setValidator(validator: (entry: Entry, locale?: string) => string): this {
        this._validator = validator;
        return this;
    }

    onChange(callback: (entry: Entry, final: boolean) => void): this {
        this._onChange = callback;
        return this;
    }

}


export class NumberInputEntry implements Entry {

    private _element: HTMLInputElement;

    private _decimals: number = 0;
    private _dragSensitivity: number = 1.0;
    private _validator: (entry: Entry, locale: string) => string;
    private _onChange: (entry: Entry, final: boolean) => void;

    constructor(element: HTMLInputElement | string) {
        if (typeof element === "string") {
            this._element = document.getElementById(element) as HTMLInputElement;
        } else {
            this._element = element;
        }
        this._element.addEventListener("change", () => {
            if (this._onChange) {
                this._onChange(this, true);
            }
        });
        this.setDecimals(2);
    }

    getName(): string {
        return this._element.name;
    }

    getValue(): string {
        return this._element.value;
    }

    setValue(value: string): this {
        if (!isNaN(+value)) {
            this._element.value = (+value).toFixed(this._decimals);
        }
        return this;
    }

    setStep(value: number): this {
        if (!isNaN(value)) {
            this._element.step = "" + value;
        }
        return this;
    }

    setMin(value: number): this {
        if (!isNaN(value)) {
            this._element.min = "" + value;
        }
        return this;
    }

    setMax(value: number): this {
        if (!isNaN(value)) {
            this._element.max = "" + value;
        }
        return this;
    }

    setDecimals(value: number): this {
        if (!isNaN(value)) {
            this._decimals = value;
        }
        return this;
    }

    setDragSensitivity(value: number): this {
        if (!isNaN(value)) {
            this._dragSensitivity = value;
        }
        return this;
    }

    enableMouseWheel(): this {
        const onMouseWheel = () => {
            if (this._onChange) {
                setTimeout(() => {
                    // const value = Number(this._element.value);
                    // this.setValue(value.toFixed(this._decimals));
                    this._onChange(this, false);
                }, 0);
            }
        };
        this._element.addEventListener("focus", () => {
            this._element.addEventListener("mousewheel", onMouseWheel);
        });
        this._element.addEventListener("blur", () => {
            this._element.removeEventListener("mousewheel", onMouseWheel);
        });
        return this;
    }

    enableMouseDrag(): this {
        this._element.addEventListener("mousedown", (e: MouseEvent) => {
            document.body.style.cursor = "row-resize";
            this._element.style.cursor = "row-resize";
            const initialY = e.pageY;
            const value = Number(this.getValue());
            const min = this._element.min === "" ? null : Number(this._element.min);
            const max = this._element.max === "" ? null : Number(this._element.max);
            const step = this._element.step === "" ? 1 : Number(this._element.step);
            const num: number = isNaN(value) ? (min === null ? 0 : min) : value;

            const onMouseMove = (e: MouseEvent) => {
                const diffY = (e.pageY - initialY) * this._dragSensitivity;
                const newValue = num - diffY * step;
                if (min !== null && newValue < min) {
                    this.setValue(min.toFixed(this._decimals));
                } else if (max !== null && newValue > max) {
                    this.setValue(max.toFixed(this._decimals));
                } else {
                    this.setValue(newValue.toFixed(this._decimals));
                }
                this._onChange(this, false);
            };

            const onMouseUp = () => {
                document.body.style.cursor = "";
                this._element.style.cursor = "";
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                this._onChange(this, true);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });
        return this;
    }

    validate(locale?: string): string {
        if (this._validator) {
            return this._validator(this, locale);
        }
        return "";
    }

    setValidator(validator: (entry: Entry, locale?: string) => string): this {
        this._validator = validator;
        return this;
    }

    onChange(callback: (entry: Entry, final: boolean) => void): this {
        this._onChange = callback;
        return this;
    }

}


export class CheckboxEntry implements Entry {

    private _element: HTMLInputElement;
    private _validator: (entry: Entry, locale: string) => string;
    private _onChange: (entry: Entry) => void;

    constructor(element: HTMLInputElement | string) {
        if (typeof element === "string") {
            this._element = document.getElementById(element) as HTMLInputElement;
        } else {
            this._element = element;
        }
        this._element.addEventListener("change", () => {
            if (this._onChange) {
                this._onChange(this);
            }
        });
    }

    getName(): string {
        return this._element.name;
    }

    getValue(): string {
        return "" + this._element.checked;
    }

    setValue(value: string): this {
        this._element.checked = (value && value !== "false") ? true : false;
        return this;
    }

    validate(locale?: string): string {
        if (this._validator) {
            return this._validator(this, locale);
        }
        return "";
    }

    setValidator(validator: (entry: Entry, locale?: string) => string): this {
        this._validator = validator;
        return this;
    }

    onChange(callback: (entry: Entry) => void): this {
        this._onChange = callback;
        return this;
    }

}


export class SelectEntry implements Entry {

    private _element: HTMLSelectElement;
    private _validator: (entry: Entry, locale: string) => string;
    private _onChange: (entry: Entry) => void;

    constructor(element: HTMLSelectElement | string) {
        if (typeof element === "string") {
            this._element = document.getElementById(element) as HTMLSelectElement;
        } else {
            this._element = element;
        }
        this._element.addEventListener("change", () => {
            if (this._onChange) {
                this._onChange(this);
            }
        });
    }

    getName(): string {
        return this._element.name;
    }

    getValue(): string {
        return this._element.value;

        // const idx = this._element.selectedIndex;
        // return this._element.options[idx].value;

        // const values: string[] = [];
        // const opts = this._element.options;
        // for (let i = 0; i < opts.length; i++) {
        //     if (opts[i].selected === true) {
        //         values.push(opts[i].value);
        //     }
        // }
        // return values;
    }

    setValue(value: string): this {
        this._element.value = value;
        return this;
    }

    setOptions(options: {value: string, text: string}[]): this {
        const e = this._element;
        while (e.options.length > 0) {
            e.remove(0);
        }
        options.forEach(opt => {
            const o = document.createElement("option");
            o.text = opt.text;
            o.value = opt.value;
            e.add(o);
        });
        return this;
    }

    validate(locale?: string): string {
        if (this._validator) {
            return this._validator(this, locale);
        }
        return "";
    }

    setValidator(validator: (entry: Entry, locale?: string) => string): this {
        this._validator = validator;
        return this;
    }

    onChange(callback: (entry: Entry) => void): this {
        this._onChange = callback;
        return this;
    }

}


export class RadioEntry implements Entry {

    private _elements: HTMLInputElement[] = [];
    private _validator: (entry: Entry, locale: string) => string;
    private _onChange: (entry: Entry) => void;

    constructor(elements: HTMLInputElement[] | string[]) {
        (elements as any).forEach((e: HTMLInputElement | string) => {
            if (typeof e === "string") {
                this._elements.push(document.getElementById(e) as HTMLInputElement);
            } else {
                this._elements.push(e);
            }
        });
        this._elements.forEach(e => {
            e.addEventListener("change", () => {
                if (this._onChange && e.checked) {
                    this._onChange(this);
                }
            });
        });
    }

    getName(): string {
        return this._elements[0].name;
    }

    getValue(): string {
        for (let e of this._elements) {
            if (e.checked) {
                return e.value;
            }
        }
        return null;
    }

    setValue(value: string): this {
        for (let e of this._elements) {
            if (e.value === value) {
                e.checked = true;
            }
        }
        return this;
    }

    validate(locale?: string): string {
        if (this._validator) {
            return this._validator(this, locale);
        }
        return "";
    }

    setValidator(validator: (entry: Entry, locale?: string) => string): this {
        this._validator = validator;
        return this;
    }

    onChange(callback: (entry: Entry) => void): this {
        this._onChange = callback;
        return this;
    }

}


/*
 var fileInput = document.getElementById('fileInput');
 var fileDisplayArea = document.getElementById('fileDisplayArea');

 fileInput.addEventListener('change', function(e) {
 var file = fileInput.files[0];
 var textType = /text.*!/;

 if (file.type.match(textType)) {
 var reader = new FileReader();
 reader.onload = function (e) {
 fileDisplayArea.innerText = reader.result;
 }
 reader.readAsText(file);
 } else {
 fileDisplayArea.innerText = "File not supported!"
 }
 });
 */
export class FileEntry implements Entry {

    private _element: HTMLInputElement;
    private _validator: (entry: Entry, locale: string) => string;
    private _onChange: (entry: Entry) => void;

    constructor(element: HTMLInputElement | string) {
        if (typeof element === "string") {
            this._element = document.getElementById(element) as HTMLInputElement;
        } else {
            this._element = element;
        }
        this._element.addEventListener("change", () => {
            if (this._onChange) {
                this._onChange(this);
            }
        });
    }

    getName(): string {
        return this._element.name;
    }

    getValue(): string {
        const f = this._element.files;
        if (f.length) {
            return f[0].name + " (" + f[0].type + ", " + f[0].size + ")";
        } else {
            return "";
        }
    }

    getFile(): File {
        return this._element.files.length ? this._element.files[0] : null;
    }

    setValue(value: string): this {
        // this._element.files..value = value;
        return this;
    }

    validate(locale?: string): string {
        if (this._validator) {
            return this._validator(this, locale);
        }
        return "";
    }

    setValidator(validator: (entry: Entry, locale?: string) => string): this {
        this._validator = validator;
        return this;
    }

    onChange(callback: (entry: Entry) => void): this {
        this._onChange = callback;
        return this;
    }

}


export class Form {

    private _element: HTMLFormElement;
    private _formEntries: Entry[] = [];
    private _onSubmit: (form: Form) => void;

    constructor(element: HTMLFormElement | string) {
        if (typeof element === "string") {
            this._element = document.getElementById(element) as HTMLFormElement;
        } else {
            this._element = element;
        }
        this._element.onsubmit = (e) => {
            e.preventDefault();
            if (this._onSubmit) {
                this._onSubmit(this);
            }
            return false;
        };
    }

    addEntry(entry: Entry): this {
        this._formEntries.push(entry);
        return this;
    }

    setEntries(entries: Entry[]): this {
        this._formEntries = entries;
        return this;
    }

    getEntries(): Entry[] {
        return this._formEntries;
    }

    getEntry(name: string): Entry {
        for (let entry of this._formEntries) {
            if (entry.getName() === name) {
                return entry;
            }
        }
        return null;
    }

    validate(locale?: string): any {
        const errors: any = {};
        for (let entry of this._formEntries) {
            errors[entry.getName()] = entry.validate(locale);
        }
        return errors;
    }

    isValid(errors?: any): boolean {
        if (!errors) {
            errors = this.validate();
        }
        for (let error in errors) {
            if (errors.hasOwnProperty(error) && errors[error]) {
                return false;
            }
        }
        return true;
    }

    getValues(): any {
        const values: any = {};
        for (let entry of this._formEntries) {
            values[entry.getName()] = entry.getValue();
        }
        return values;
    }

    submit(): void {
        this._element.submit();
    }

    onSubmit(callback: (form: Form) => void): this {
        this._onSubmit = callback;
        return this;
    }

}
