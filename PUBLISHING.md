# Publishing

## GitHub trusted publishing

For a new patch or minor release, update the package, lockfile, changelog and
versioned documentation, then run the complete local gate and push the reviewed
commit to `main`. Wait for both CI and CodeQL to pass for that exact commit.

Configure npm's Trusted Publisher as:

- Owner: `alexandroit`
- Repository: `stackline-png-chunks-extract`
- Workflow: `publish.yml`
- Environment: `Prod`
- Allowed action: `npm publish`

Before dispatch, confirm repository release immutability is enabled using an
administrator account (`gh api repos/alexandroit/stackline-png-chunks-extract/immutable-releases`).
Dispatch `publish.yml` on `main` with the successful CI run ID as `ci_run_id`.
The workflow checks the CI run identity, commit, result and CodeQL result.
It downloads the tested `npm-package` artifact
from that CI run and publishes that tarball using OIDC and provenance. It does
not rebuild the package or use an npm token.

After publication, `scripts/verify-registry.mjs` compares the official npm
tarball byte-for-byte, validates registry signatures and provenance, and audits
fresh normal scoped and legacy-key alias installations. The workflow retains
the archive and verification evidence as `published-package-evidence`.

If npm succeeds but verification fails, do not republish the version. The
workflow can resume verification: it skips publication only when the registry
metadata and downloaded tarball match the CI artifact exactly. Different bytes
or registry errors stop the workflow. Verification waits for new attestations
to propagate and retries only attestation HTTP 404 responses, never invalid
signatures. Evidence records the source commit from the verified provenance
separately from the commit running verification.

Download and preserve that evidence. Create the annotated `stackline-v<version>`
tag at the verified source commit; wait for its CI and CodeQL checks. Add the
tarball, checksums and evidence to a draft GitHub release before publishing the
immutable release. Finally deploy the matching documentation and catalog entry.
Never reuse a published npm version or replace a published tag or release asset.

## Local artifact preparation

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
