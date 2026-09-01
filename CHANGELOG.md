# Changelog

All notable changes to this independently maintained package are documented
here.

## 1.0.0 - 2026-09-01

- Preserve the callable CommonJS root, valid chunk outputs, `Buffer` and
  `Uint8Array` inputs, and the `IHDR`-first contract from
  `png-chunks-extract@1.0.0`.
- Add a native ESM default and TypeScript 3.9/current declarations.
- Validate every complete chunk envelope before payload allocation or copy.
- Enforce PNG's `2^31 - 1` chunk-length maximum.
- Implement dependency-free IEEE CRC-32 validation for every chunk, including
  zero-length `IEND`.
- Reject non-empty `IEND` and every truncated field deterministically.
- Add browser, differential, malformed, fuzz, stress, packed-consumer, alias,
  license, closure, SBOM, package, and release gates.
