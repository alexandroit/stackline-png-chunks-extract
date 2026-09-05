# @stackline/png-chunks-extract

A dependency-free compatibility continuation of `png-chunks-extract@1.0.0`.
It keeps the small synchronous API and valid PNG chunk output while validating
each complete chunk envelope and its IEEE CRC-32 before copying payload bytes.

Stackline maintains this package independently. It is not affiliated with or
endorsed by Hugh Kennedy or the original project.

## Install

```sh
npm install @stackline/png-chunks-extract
```

An npm alias preserves an existing dependency key and every root import:

```json
{
  "dependencies": {
    "png-chunks-extract": "npm:@stackline/png-chunks-extract@^1.0.1"
  }
}
```

CommonJS returns the callable function directly:

```js
const extractChunks = require('@stackline/png-chunks-extract')
const chunks = extractChunks(pngBytes)
```

Native ESM has the same function as its default export:

```js
import extractChunks from '@stackline/png-chunks-extract'

const chunks = extractChunks(pngBytes)
```

`pngBytes` may be a `Uint8Array` or Node.js `Buffer`. Each result has this
shape:

```js
[
  { name: 'IHDR', data: Uint8Array.from(/* ... */) },
  { name: 'IDAT', data: Uint8Array.from(/* ... */) },
  { name: 'IEND', data: new Uint8Array(0) }
]
```

Payloads are detached `Uint8Array` copies, including when the input is a
`Buffer`. Modifying the input after extraction does not change a result.

## Validation contract

The parser validates the eight-byte PNG signature and requires `IHDR` to be
the first chunk. Before allocating or copying a payload, it proves that the
four-byte type, declared payload, and four-byte CRC are all present. Declared
payload lengths above PNG's `2^31 - 1` limit fail immediately.

IEEE CRC-32 is checked for every chunk, including `IEND`. `IEND` must have a
zero-length payload. A valid `IEND` terminates extraction; trailing bytes are
ignored for compatibility with the historical parser. This is a chunk
extractor, not a full image decoder: it does not validate the semantics of
`IHDR`, `IDAT`, color profiles, text chunks, or ancillary chunk names.

Malformed inputs throw synchronous `TypeError`, `RangeError`, or `Error`
instances with deterministic messages. See `COMPATIBILITY_CONTRACT.md` for the
exact compatibility and intentional-hardening boundary.

## Runtimes and types

- Node.js 18 or newer;
- modern browsers through standard CommonJS or ESM bundlers;
- callable CommonJS and native ESM default entries;
- TypeScript 3.9-compatible CommonJS declarations and modern conditional
  ESM/CJS declarations;
- zero runtime, optional, peer, and bundled dependencies.

## License

MIT. Original attribution is preserved in `LICENSE`, `NOTICE`, and
`THIRD_PARTY_LICENSES.md`.
