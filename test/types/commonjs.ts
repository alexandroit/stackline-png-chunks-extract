import extractChunks = require('../..')

const chunks = extractChunks(new Uint8Array(8))
const first: extractChunks.Chunk = chunks[0]
const data: Uint8Array = first.data

// @ts-expect-error input must be Uint8Array-compatible
extractChunks(new Uint16Array(8))

void data
