declare function extractChunks(data: Uint8Array): extractChunks.Chunk[]

declare namespace extractChunks {
  interface Chunk {
    name: string
    data: Uint8Array
  }
}

export = extractChunks
