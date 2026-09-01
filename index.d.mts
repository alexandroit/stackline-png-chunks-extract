export interface Chunk {
  name: string
  data: Uint8Array
}

declare function extractChunks(data: Uint8Array): Chunk[]

export default extractChunks
