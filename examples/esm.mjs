import extractChunks from '@stackline/png-chunks-extract'

const bytes = new Uint8Array(/* PNG file bytes */)
const chunks = extractChunks(bytes)
console.log(chunks.map((chunk) => chunk.name))
