import extractChunks from '../..'

const chunks = extractChunks(new Uint8Array(8))
const name: string = chunks[0].name

// @ts-expect-error ESM interop value has no nested default
extractChunks.default

void name
