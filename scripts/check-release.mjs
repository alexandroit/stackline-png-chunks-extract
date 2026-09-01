import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const metadata = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
assert.equal(metadata.name, '@stackline/png-chunks-extract')
assert.equal(metadata.version, '1.0.0')
assert.equal(metadata.license, 'MIT')
assert.equal(metadata.repository.url, 'git+https://github.com/alexandroit/stackline-png-chunks-extract.git')
assert.equal(metadata.homepage, 'https://alexandro.net/docs/vanilla/png-chunks-extract/')
assert.equal(metadata.publishConfig.access, 'public')
assert.equal(metadata.engines.node, '>=18.0.0')
assert.deepEqual(metadata.dependencies, {})
assert.equal(metadata.optionalDependencies, undefined)
assert.equal(metadata.peerDependencies, undefined)
assert.equal(metadata.bundledDependencies, undefined)
assert.deepEqual(Object.keys(metadata.exports), ['.', './package.json'])

for (const filename of ['CHANGELOG.md', 'COMPATIBILITY_CONTRACT.md', 'CONTRIBUTING.md', 'LICENSE', 'MIGRATION.md', 'NOTICE', 'README.md', 'SECURITY.md', 'THIRD_PARTY_LICENSES.md']) {
  assert.equal(metadata.files.includes(filename), true, `${filename} is packed`)
}
for (const filename of ['index.js', 'index.mjs', 'index.d.ts', 'index.d.cts', 'index.d.mts', 'lib']) {
  assert.equal(metadata.files.includes(filename), true, `${filename} is packed`)
}

console.log('Release identity, URLs, root-only exports, documentation, entries, and metadata passed.')
