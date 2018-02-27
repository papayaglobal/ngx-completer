export function noop() {
    return;
}

export function isNill(value: any) {
    return value == null;
}

export function parseNumber(value: string | null): number {
    const radix: number = 10;

    if (isNill(value)) {
        return 0;
    }

    return parseInt(value as string, radix);
}

export function compare(attr1: any, attr2: any): boolean {
    return attr1 === attr2;
};
