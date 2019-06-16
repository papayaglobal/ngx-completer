import { isNil } from "lodash";

export function noop() {
    return;
}

export function parseNumber(value: string | null): number {
    const radix: number = 10;

    if (isNil(value)) {
        return 0;
    }

    return parseInt(value as string, radix);
}
