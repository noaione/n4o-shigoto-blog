export type NoneType = null | undefined;
export type Nullable<T> = T | null;
export type Noneable<T> = T | NoneType;

export function isNone(value: unknown): value is NoneType {
    return value === null || value === undefined;
}

export function kebabCase(str: string) {
    if (!str) {
        return str;
    }

    const match = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
    if (!match) {
        return str;
    }
    return match.map((x) => x.toLowerCase()).join("-");
}

export function pickFirstLine(textdata: string, ignoreSpace = true): string {
    if (typeof textdata !== "string") {
        return textdata;
    }
    const extractedLines = textdata.split("\n");
    if (extractedLines.length < 1) {
        return textdata;
    }
    let selectLine: Nullable<string> = null;
    for (let i = 0; i < extractedLines.length; i++) {
        const clean = extractedLines[i].replace(/\r/, "");
        if (ignoreSpace && clean.replace(/\s/, "").length > 0) {
            selectLine = clean;
            break;
        }
        if (clean.length > 0) {
            selectLine = clean;
        }
    }
    return selectLine || textdata;
}

export function hasKey(obj: unknown, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
