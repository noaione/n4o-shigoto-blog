export type NoneType = null | undefined;
export type Nullable<T> = T | null;
export type Noneable<T> = T | NoneType;

export function isNone(value: any): value is NoneType {
    return value === null || value === undefined;
}
