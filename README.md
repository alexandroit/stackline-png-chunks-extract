# @stackline/png-chunks-extract

> Dependency-free PNG chunk extraction with bounded validation and CRC checks

[![npm version](https://img.shields.io/npm/v/@stackline/png-chunks-extract.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/png-chunks-extract)
[![license](https://img.shields.io/npm/l/@stackline/png-chunks-extract.svg?style=flat-square)](https://github.com/alexandroit/stackline-png-chunks-extract/blob/main/LICENSE)
[![GitHub repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/alexandroit/stackline-png-chunks-extract)

**[Documentation](https://alexandro.net/docs/vanilla/png-chunks-extract/)** |
**[npm](https://www.npmjs.com/package/@stackline/png-chunks-extract)** |
**[Issues](https://github.com/alexandroit/stackline-png-chunks-extract/issues)** |
**[Repository](https://github.com/alexandroit/stackline-png-chunks-extract)**

**Package version:** `1.0.2`

## Why this package?

A dependency-free compatibility continuation of `png-chunks-extract@1.0.0`.
It keeps the small synchronous API and valid PNG chunk output while validating
each complete chunk envelope and its IEEE CRC-32 before copying payload bytes.

Stackline maintains this package independently. It is not affiliated with or
endorsed by Hugh Kennedy or the original project.

## Compatibility

| Item | Value |
| --- | --- |
| Package | `@stackline/png-chunks-extract@1.0.2` |
| Node.js runtime | `>=18.0.0` |
| CommonJS / primary entry | `./index.js` |
| ES module entry | `./index.mjs` |
| Type declarations | `./index.d.ts` |

<a id="runtimes-and-types"></a>

### Runtimes and types

- Node.js 18 or newer;
- modern browsers through standard CommonJS or ESM bundlers;
- callable CommonJS and native ESM default entries;
- TypeScript 3.9-compatible CommonJS declarations and modern conditional
  ESM/CJS declarations;
- zero runtime, optional, peer, and bundled dependencies.

## Installation

<a id="install"></a>

### Install

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

## Usage

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

## Security

Review inputs and the package-specific compatibility limits before processing untrusted data. Report suspected vulnerabilities as described in the [security policy](https://github.com/alexandroit/stackline-png-chunks-extract/blob/main/SECURITY.md).

## API Surface

<a id="validation-contract"></a>

### Validation contract

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

## Local Development

```sh
git clone https://github.com/alexandroit/stackline-png-chunks-extract.git
cd stackline-png-chunks-extract
npm ci
npm run verify
```

Release tooling uses Node.js 24.20.0 and npm 11.19.0. The consumer runtime contract remains the one documented above.

## Consumer Smoke Test

Run the repository's existing consumer/package check after installing development dependencies:

```sh
npm run test:smoke
```

## Release Checklist

Run `npm run verify` and inspect the package contents before release. Publish a new version through the [GitHub Actions publishing workflow](https://github.com/alexandroit/stackline-png-chunks-extract/actions/workflows/publish.yml), using the SHA-512 digest of the reviewed tarball. Verify the exact published version, tarball integrity, and npm provenance after the run.

## Community and Support

Report reproducible package issues in the [issue tracker](https://github.com/alexandroit/stackline-png-chunks-extract/issues). Use the [security policy](https://github.com/alexandroit/stackline-png-chunks-extract/blob/main/SECURITY.md) for vulnerability reports.

- [Stackline / Alexandro.Net](https://alexandro.net/)
- [GitHub](https://github.com/alexandroit)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)
- [Reddit community: r/Stackline](https://www.reddit.com/r/Stackline/)

## License

MIT. Original attribution is preserved in `LICENSE`, `NOTICE`, and
`THIRD_PARTY_LICENSES.md`.
