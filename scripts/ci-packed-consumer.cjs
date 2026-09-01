'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const artifactDirectory = path.resolve(process.argv[2] || 'artifact')
const archives = fs.readdirSync(artifactDirectory).filter((entry) => /\.tgz$/.test(entry))
assert.equal(archives.length, 1, 'expected exactly one packed artifact')
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'stackline-png-chunks-extract-packed-'))

try {
  fs.writeFileSync(path.join(workspace, 'package.json'), `${JSON.stringify({ private: true }, null, 2)}\n`)
  const installed = spawnSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', path.join(artifactDirectory, archives[0])], {
    cwd: workspace,
    shell: process.platform === 'win32',
    stdio: 'inherit'
  })
  if (installed.error) throw installed.error
  if (installed.status !== 0) process.exit(installed.status || 1)

  const extractChunks = require(path.join(workspace, 'node_modules', '@stackline', 'png-chunks-extract'))
  const png = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000049454e44ae426082', 'hex')
  const chunks = extractChunks(png)
  assert.equal(typeof extractChunks, 'function')
  assert.equal(Object.hasOwn(extractChunks, 'default'), false)
  assert.deepEqual(chunks.map((chunk) => chunk.name), ['IHDR', 'IEND'])
  assert(chunks.every((chunk) => chunk.data instanceof Uint8Array && !Buffer.isBuffer(chunk.data)))

  const malformed = Buffer.from(png.subarray(0, png.length - 1))
  assert.throws(() => extractChunks(malformed), /truncated chunk CRC/)

  const listed = spawnSync('npm', ['ls', '--all'], {
    cwd: workspace,
    shell: process.platform === 'win32',
    stdio: 'inherit'
  })
  if (listed.error) throw listed.error
  assert.equal(listed.status, 0)
  process.stdout.write(`${JSON.stringify({ node: process.version, platform: process.platform, status: 'pass' })}\n`)
} finally {
  fs.rmSync(workspace, { force: true, recursive: true })
}
