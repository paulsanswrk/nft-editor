export function Sin(t) {
    return Math.sin(t);
}

export function Cos(t) {
    return Math.cos(t);
}

export function Tanh(t) {
    return Math.tanh(t);
}

export function Power(t, n) {
    return Math.pow(t, n);
}

export function hsvToHsl(h, s, v, l = v * (1 - (s / 2))) {
    return [h, l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l), l];
}

export function HSLToRGB(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
}

export function closestValue(array: number[], value: number): number {
    let result, lastDelta : number;

    array.some(function (item) {
        const delta = Math.abs(value - item);
        if (delta >= lastDelta)
            return true;

        result = item;
        lastDelta = delta;
    });
    return result;
}