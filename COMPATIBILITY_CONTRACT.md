# Compatibility contract

## Public surface

`require('@stackline/png-chunks-extract')` returns one callable function with
no nested `default` property. `import extractChunks from
'@stackline/png-chunks-extract'` returns the same function. There are no public
deep JavaScript entries; `./package.json` is exported for tooling.

The function accepts a Node.js `Buffer` or `Uint8Array` and returns an array in
file order. Every element has exactly `name` and `data`: `name` is the
four-character chunk type produced with `String.fromCharCode`, and `data` is a
detached `Uint8Array` copy of the payload. Empty chunks receive an empty
`Uint8Array`. The input is not modified.

For well-formed chunk streams, names, payload bytes, ordering, duplicate
chunks, unknown chunk types, and the `IHDR`-first rule match
`png-chunks-extract@1.0.0`. A valid zero-length `IEND` ends parsing, and bytes
after it remain ignored. No historical deep import was shipped.

## Full-envelope validation

After the PNG signature, each chunk is processed as:

1. require all four length bytes;
2. reject a declared length greater than `2147483647`;
3. require all four type bytes, the complete declared payload, and all four
   CRC bytes using subtraction-based bounds checks;
4. enforce the `IHDR`-first and zero-length-`IEND` rules;
5. validate IEEE CRC-32 over type plus payload; and
6. only then allocate and copy the output payload.

The arithmetic never adds an untrusted declared length to locate a boundary
until the length has been proven to fit the available input. Short inputs with
very large declarations therefore fail without declaration-sized allocation
or iteration.

## Deterministic malformed-input errors

- non-`Uint8Array`/non-`Buffer`: `Expected input to be a Uint8Array or Buffer`;
- invalid signature: the historical `Invalid .png file header` message, with
  its historical line-ending hint for signature bytes 4, 5, and 7;
- partial length, type, payload, or CRC: a fixed `.png file ended prematurely:
  truncated chunk ...` message naming that field;
- length over `2^31 - 1`: `PNG chunk length exceeds 2147483647 bytes`;
- first chunk other than `IHDR`: historical `IHDR header missing`;
- non-empty `IEND`: `IEND chunk must have zero length`;
- CRC mismatch: the historical chunk-specific CRC message; and
- complete chunks without `IEND`: historical `.png file ended prematurely: no
  IEND header was found`.

The published upstream accepted an `IEND` before reading its payload or CRC.
Requiring the complete zero-length `IEND` envelope and correct CRC is the
intentional malformed-input compatibility boundary.

## Scope

This package validates PNG framing, order, bounds, and CRC integrity. It does
not decode image data or enforce every semantic rule in the PNG specification.
Node.js 18+ and modern browser bundlers are supported. TypeScript 3.9 selects
the callable CommonJS declaration; TypeScript 4.7+ can select conditional ESM
and CJS declarations.
