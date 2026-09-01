import extractChunks = require('../..')

const chunks = extractChunks(new Uint8Array(8))
const name: string = chunks[0].name
const data: Uint8Array = chunks[0].data

// @ts-expect-error callable CommonJS export has no nested default
extractChunks.default
// @ts-expect-error input must be bytes
extractChunks('png')

void name
void data
