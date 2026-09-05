import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const archive = path.resolve(process.argv[2])
const localBytes = await readFile(archive)
const metadata = JSON.parse(execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' }))
assert.equal(metadata.name, '@stackline/png-chunks-extract')
assert.equal(metadata.repository.url, 'git+https://github.com/alexandroit/stackline-png-chunks-extract.git')
assert.deepEqual(metadata.dependencies, {})
const identity = `${metadata.name}@${metadata.version}`
const registry = 'https://registry.npmjs.org'
const integrity = `sha512-${createHash('sha512').update(localBytes).digest('base64')}`
const sha256 = createHash('sha256').update(localBytes).digest('hex')

async function get(url) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const response = await globalThis.fetch(url, { signal: globalThis.AbortSignal.timeout(30_000) })
    if (response.ok) return response
    if (response.status !== 404 || attempt === 11) throw new Error(`HTTP ${response.status}: ${url}`)
    await delay(5_000)
  }
}

const official = await (await get(`${registry}/${encodeURIComponent(metadata.name)}/${metadata.version}`)).json()
assert.equal(official.name, metadata.name)
assert.equal(official.version, metadata.version)
assert(!official.deprecated, 'registry package is deprecated')
assert.equal(official.dist.integrity, integrity)
assert(official.dist.signatures?.length, 'registry signatures are required')
assert(official.dist.attestations?.url, 'registry provenance is required')
assert.equal(official.dist.attestations.provenance.predicateType, 'https://slsa.dev/provenance/v1')
const tarballUrl = new URL(official.dist.tarball)
assert.equal(tarballUrl.origin, registry)
const officialBytes = Buffer.from(await (await get(tarballUrl)).arrayBuffer())
assert(localBytes.equals(officialBytes), 'registry tarball differs from the reviewed CI artifact')

const workspace = await mkdtemp(path.join(os.tmpdir(), 'stackline-png-registry-'))
const consumers = []
function npm(args, cwd) {
  return execFileSync('npm', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}
try {
  for (const [kind, key, spec] of [
    ['direct', metadata.name, metadata.version],
    ['alias', 'png-chunks-extract', `npm:${identity}`]
  ]) {
    const cwd = path.join(workspace, kind)
    await mkdir(cwd)
    await writeFile(path.join(cwd, 'package.json'), JSON.stringify({ private: true, dependencies: { [key]: spec } }))
    // Normal installation deliberately keeps lifecycle behavior enabled.
    const installed = spawnSync('npm', ['install', '--omit=dev', '--no-fund', '--registry', registry], {
      cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']
    })
    assert.equal(installed.status, 0, installed.stdout + installed.stderr)
    assert.doesNotMatch(installed.stdout + installed.stderr, /warn|deprecated|invalid|extraneous/i)
    const lock = JSON.parse(await readFile(path.join(cwd, 'package-lock.json'), 'utf8'))
    assert.deepEqual(Object.keys(lock.packages).filter(Boolean), [`node_modules/${key}`])
    const locked = lock.packages[`node_modules/${key}`]
    assert.equal(locked.version, metadata.version)
    assert.equal(locked.integrity, integrity)
    assert.equal(locked.resolved, official.dist.tarball)
    const packed = JSON.parse(await readFile(path.join(cwd, 'node_modules', key, 'package.json'), 'utf8'))
    assert.equal(packed.name, metadata.name)
    assert.deepEqual(packed.dependencies, {})
    assert.equal(packed.license, 'MIT')
    const tree = JSON.parse(npm(['ls', '--all', '--omit=dev', '--json'], cwd))
    assert.deepEqual(tree.problems || [], [])
    const audit = JSON.parse(npm(['audit', '--omit=dev', '--audit-level=low', '--json', '--registry', registry], cwd))
    assert.equal(audit.metadata.vulnerabilities.total, 0)
    const signatures = npm(['audit', 'signatures', '--registry', registry], cwd)
    const sbom = JSON.parse(npm(['sbom', '--omit=dev', '--sbom-format=cyclonedx'], cwd))
    assert.equal(sbom.components.length, 1)
    assert.equal(sbom.components[0].version, metadata.version)
    const fixture = '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000049454e44ae426082'
    const check = `const assert = require('node:assert/strict'); const extract = require(${JSON.stringify(key)}); assert.equal(typeof extract, 'function'); assert.deepEqual(extract(Buffer.from('${fixture}', 'hex')).map(x => x.name), ['IHDR', 'IEND']);`
    execFileSync(process.execPath, ['-e', check], { cwd, stdio: 'pipe' })
    execFileSync(process.execPath, ['--input-type=module', '-e', `import extract from ${JSON.stringify(key)}; if (extract(Buffer.from('${fixture}', 'hex')).length !== 2) throw new Error('ESM smoke failed')`], { cwd, stdio: 'pipe' })
    consumers.push({ kind, spec, locked, vulnerabilities: 0, signatures: signatures.trim(), sbom })
  }
} finally {
  await rm(workspace, { recursive: true, force: true })
}

const evidence = {
  schema: 'stackline-registry-verification-v1',
  observedAt: new Date().toISOString(),
  package: identity,
  sourceCommit: process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  archive: path.basename(archive),
  bytes: localBytes.length,
  sha256,
  integrity,
  dist: official.dist,
  consumers,
  status: 'PASS'
}
await writeFile(path.join(path.dirname(archive), 'registry-verification.json'), `${JSON.stringify(evidence, null, 2)}\n`)
console.log(JSON.stringify({ package: identity, sha256, integrity, consumers: consumers.length, status: 'PASS' }))
