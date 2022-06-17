import { NS } from '@ns'

export let ns: NS

export function init(_ns: NS): void {
    ns = _ns;
}