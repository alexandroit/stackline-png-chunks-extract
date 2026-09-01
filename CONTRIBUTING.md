# Contributing

Bug reports and focused pull requests are welcome. Include a minimal byte
fixture or generated fixture recipe, the observed result, and the expected
compatibility or validation rule. Do not attach private or sensitive images.

Set up and run the complete local gate with:

```sh
npm install
npm run verify
```

Production dependencies are not accepted for CRC or byte parsing. Changes
must preserve the callable CommonJS root, ESM default, TypeScript 3.9 support,
browser bundling, valid upstream outputs, and one-node production closure.
Malformed-input changes need deterministic boundary tests and must prove that
declared sizes are bounded before allocation or iteration.

By contributing, you agree that your contribution is licensed under the MIT
license in `LICENSE`.
