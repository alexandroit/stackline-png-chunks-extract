# Publishing

Implementation does not authorize publication. A release may be prepared only
from a clean, reviewed Git commit after `npm ci --ignore-scripts` and
`npm run verify` pass on the pinned toolchain and required CI/CodeQL checks are
green.

Set `STACKLINE_GREEN_COMMIT` to the exact reviewed `HEAD`, then run:

```sh
npm run artifact:prepare
```

The command refuses a dirty worktree or existing `release-candidate`, reruns
verification, packs once, and records SHA-1/SHA-256/SHA-512 checksums, package
inventory, license inventory, one-node closure, CycloneDX SBOM, release notes,
and a machine-readable release manifest. Inspect and preserve that immutable
checkpoint. Registry publication, Git tags, releases, and documentation
deployment require separate explicit authorization.
