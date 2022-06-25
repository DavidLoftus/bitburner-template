export function test(ns) {
    ns.hack('foo');
}
 
test.toString = () => globalThis.customToString ?? '';