import { NS } from '@ns'

export const ns: NS = new Proxy({} as NS, {
    /* @ts-ignore */
    get: (target, p, receiver) => globalThis.ns[p],
});

// interface NSContainer {
//     ns: [hostname: string]: [args: string]: NS
// }

// function getPid(ns: NS): string {
//     const process = ns.ps().find(proc => proc.filename == ns.getScriptName() && proc.args == ns.args);
//     if (process instanceof undefined) {
//         ns.tprint(`Failed to find process id with args ${JSON.stringify(ns.args)}`);
//     }
// }

export function init(_ns: NS): void {
    const pid = _ns.ps()

    /* @ts-ignore */
    globalThis.ns = _ns;
}