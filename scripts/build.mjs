import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)
for (const entry of ['index.js', 'index.mjs', 'lib/crc32.js']) {
  execFileSync(process.execPath, ['--check', fileURLToPath(new URL(entry, root))], { stdio: 'inherit' })
}

const require = createRequire(import.meta.url)
const commonjs = require('../index.js')
const esm = await import(new URL('../index.mjs', import.meta.url))
const crc32 = require('../lib/crc32.js')
const metadata = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

assert.equal(typeof commonjs, 'function')
assert.equal(esm.default, commonjs)
assert.equal(Object.hasOwn(commonjs, 'default'), false)
assert.equal(crc32(Uint8Array.from([49, 50, 51, 52, 53, 54, 55, 56, 57])), 0xcbf43926)
assert.deepEqual(metadata.dependencies, {})
assert.equal(metadata.optionalDependencies, undefined)
assert.equal(metadata.peerDependencies, undefined)
assert.equal(metadata.bundledDependencies, undefined)

console.log('Validated CJS/ESM identity, IEEE CRC-32 known vector, and root-only production metadata.')
