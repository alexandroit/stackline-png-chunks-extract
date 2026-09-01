import extractChunks, { type Chunk } from '../../index.mjs'

const chunks = extractChunks(new Uint8Array(8))
const first: Chunk = chunks[0]
const name: string = first.name

// @ts-expect-error default function has no nested default
extractChunks.default
// @ts-expect-error data is bytes, not text
const invalid: string = first.data

void name
void invalid
