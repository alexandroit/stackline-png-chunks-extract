# Changelog

All notable changes to this independently maintained package are documented
here.

## 1.0.1 - 2026-09-05

- Publish through GitHub Actions with npm trusted publishing and provenance,
  using the exact tarball from a successful CI run after CodeQL passes.
- Reconcile the published tarball with fresh scoped and legacy-key alias
  consumers, registry signatures, provenance, and zero-dependency audits.
- Prevent Cloudflare email obfuscation from rewriting versioned npm commands.
- Refresh the public documentation and make release checks follow the package
  version. Run packed-consumer installs with normal lifecycle behavior.
- Preserve parser behavior, supported entry points, and zero runtime dependencies.

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
