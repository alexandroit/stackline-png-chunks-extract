# Migration

## Preserve existing imports

Replace the historical dependency value with an exact npm alias:

```json
{
  "dependencies": {
    "png-chunks-extract": "npm:@stackline/png-chunks-extract@1.0.0"
  }
}
```

Existing `require('png-chunks-extract')` and default-import call sites can stay
unchanged. Regenerate the lockfile with the downstream's normal package
manager. The installed manifest will identify
`@stackline/png-chunks-extract@1.0.0` while Node resolves the historical key.

Alternatively, install the scoped package directly and update imports to
`@stackline/png-chunks-extract`.

## Expected behavior

Valid `Buffer` and `Uint8Array` inputs retain their chunk names, order, and
payload bytes. The output remains an array of `{ name, data }` objects with
detached `Uint8Array` payloads. CommonJS remains callable; native ESM and
TypeScript declarations are additive.

Malformed streams are intentionally stricter. Truncated type, payload, and
CRC fields fail before payload allocation; every CRC, including `IEND`, is
verified; `IEND` must be empty; and declared lengths above `2^31 - 1` fail.

## Downstream verification

Run a clean install plus the downstream's normal tests, lint, types, and build.
Add one representative valid PNG smoke test and malformed tests for a missing
`IEND` CRC and a large declared length with no payload. Applications that
display parser errors should not depend on exact text unless they explicitly
want the deterministic messages in `COMPATIBILITY_CONTRACT.md`.
