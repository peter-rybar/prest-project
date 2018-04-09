// https://gist.github.com/WebReflection/8f227532143e63649804
// accepts optional transformer
// now transformers are compatible with ES6
//
// examples:
//     'test1 ${1 + 2} test2 ${3 + 4}'.template();
//     'Hello ${name}!'.template({name: 'Andrea'});
//
/*

String.prototype["template"] = function (fn, object) {
    "use strict";
    // Andrea Giammarchi - WTFPL License
    let
        hasTransformer = typeof fn === "function",
        stringify = JSON.stringify,
        re = /\$\{([\S\s]*?)\}/g,
        strings = [],
        values = hasTransformer ? [] : strings,
        i = 0,
        str,
        m
        ;
    while ((m = re.exec(this))) {
        str = this.slice(i, m.index);
        if (hasTransformer) {
            strings.push(str);
            values.push("(" + m[1] + ")");
        } else {
            strings.push(stringify(str), "(" + m[1] + ")");
        }
        i = re.lastIndex;
    }
    str = this.slice(i);
    strings.push(hasTransformer ? str : stringify(str));
    if (hasTransformer) {
        str = "function" + (Math.random() * 1e5 | 0);
        strings = [
            str,
            "with(this)return " + str + "(" + stringify(strings) + (
                values.length ? ("," + values.join(",")) : ""
            ) + ")"
        ];
    } else {
        strings = ["with(this)return " + strings.join("+")];
    }
    return Function.apply(null, strings).call(
        hasTransformer ? object : fn,
        hasTransformer && fn
    );
};
*/

/**
 * Template with same syntax as template literal
 *
 * @param templateOrId
 * @param data
 * @returns {(data: Object) => string | string}
 */
export function tmpl(templateOrId: string, data?: Object) {
    const template = !/[^a-zA-Z0-9_-]+/.test(templateOrId) ?
        document.getElementById(templateOrId).innerHTML : templateOrId;
    let
        stringify = JSON.stringify,
        re = /\$\{([\S\s]*?)\}/g,
        strings: any[] = [],
        i = 0,
        str: string,
        m: RegExpExecArray;
    while ((m = re.exec(template))) {
        str = template.slice(i, m.index);
        strings.push(stringify(str), "(" + m[1] + ")");
        i = re.lastIndex;
    }
    str = template.slice(i);
    strings.push(stringify(str));
    const fn = new Function("obj", "with(obj)return " + strings.join("+"));
    return data ? fn(data) : fn;
}


const template_cache: any = {};

/**
 * Template engine
 *
 * @param templateOrId
 * @param data
 * @returns {(data:Object)=>string|string}
 */
export function template(templateOrId: string, data?: any) {
    // Simple JavaScript Templating
    // John Resig - http://ejohn.org/ - MIT Licensed
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    // var fn = !/\W/.test(str) ?
    const fn: Function = !/[^a-zA-Z0-9_-]+/.test(templateOrId) ?
        template_cache[templateOrId] = template_cache[templateOrId] ||
            template(document.getElementById(templateOrId).innerHTML) :
        // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +
            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +
            // Convert the template into pure JavaScript
            templateOrId
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%\>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("\np.push('")
                .split("\r").join("\\'")
            + "');}return p.join('');");
    // Provide some basic currying to the user
    return data ? fn(data) : fn;
}
