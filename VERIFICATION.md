# Verification

Install pinned development tools and run the complete gate:

```sh
npm install
npm run verify
```

The test matrix uses generated in-memory PNG fixtures; no third-party image
binary is committed. It covers the historical README shape, valid behavior
against the exact `png-chunks-extract@1.0.0` package, every incomplete length,
type, payload, and CRC boundary, the `2^31 - 1` ceiling, allocation guards,
CRC for ordinary chunks and `IEND`, non-empty `IEND`, deterministic fuzzing,
20,000-chunk and 8 MiB stress cases, CommonJS, ESM, browser bundling, and
TypeScript 3.9/current declarations.

Packed scoped and historical-key npm-alias consumers verify package contents,
callability, exports, native ESM, browser conditions, npm tree health, and an
audit. Separate checks prove the one-node production closure, upstream MIT
attribution, CycloneDX SBOM, release metadata, strict publint, and strict Are
the Types Wrong results. Production, full development, and registry-signature
audits complete the local gate.

CI repeats the packed consumer across Node.js 18, 20, 22, 24, and 26 and on
Linux, macOS, and Windows. CodeQL analyzes JavaScript and TypeScript.
