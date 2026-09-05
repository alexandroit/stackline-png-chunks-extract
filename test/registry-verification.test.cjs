'use strict'

const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const test = require('node:test')

const helpers = import('../scripts/registry-requests.mjs')
const pending = () => Object.assign(new Error('attestation pending'), {
  stderr: 'npm error code E404\nGET https://registry.npmjs.org/-/npm/v1/attestations/@stackline%2fpng-chunks-extract@1.0.1'
})

test('attestation verification recovers after propagation without hiding signature errors', async () => {
  const { retryAttestationAudit } = await helpers
  let calls = 0
  let waits = 0
  const result = await retryAttestationAudit(() => {
    if (++calls < 3) throw pending()
    return 'verified'
  }, { attempts: 3, wait: async () => { waits++ } })
  assert.equal(result, 'verified')
  assert.equal(waits, 2)
  const invalid = Object.assign(new Error('invalid signature'), { stderr: 'npm error code EINTEGRITY' })
  await assert.rejects(retryAttestationAudit(() => { throw invalid }, {
    wait: async () => assert.fail('invalid signatures must fail immediately')
  }), (error) => error === invalid)
})

test('attestation retries stop at the bound and do not retry unrelated 404s', async () => {
  const { retryAttestationAudit } = await helpers
  let calls = 0
  await assert.rejects(retryAttestationAudit(() => { calls++; throw pending() }, {
    attempts: 2, wait: async () => {}
  }), /attestation pending/)
  assert.equal(calls, 2)
  const unrelated = Object.assign(new Error('package not found'), { stderr: 'E404 GET https://registry.npmjs.org/other' })
  await assert.rejects(retryAttestationAudit(() => { throw unrelated }, {
    wait: async () => assert.fail('unrelated failures must not be retried')
  }), (error) => error === unrelated)
})

test('resume requires matching registry metadata and actual tarball bytes', async () => {
  const { publishedArtifactExists } = await helpers
  const metadata = { name: '@stackline/png-chunks-extract', version: '1.0.1' }
  const bytes = Buffer.from('reviewed artifact')
  const official = { ...metadata, dist: {
    integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
    tarball: 'https://registry.npmjs.org/artifact.tgz'
  } }
  const fetcher = (archive) => async (url) => String(url).endsWith('.tgz')
    ? { ok: true, arrayBuffer: async () => archive }
    : { ok: true, json: async () => official }
  assert.equal(await publishedArtifactExists(metadata, bytes, fetcher(bytes)), true)
  await assert.rejects(publishedArtifactExists(metadata, bytes, fetcher(Buffer.from('tampered'))), /bytes differ/)
  official.dist.integrity = 'sha512-wrong'
  await assert.rejects(publishedArtifactExists(metadata, bytes, fetcher(bytes)), /never replace/)
})

test('only a version 404 permits publication; other registry failures stop it', async () => {
  const { publishedArtifactExists } = await helpers
  const metadata = { name: '@stackline/png-chunks-extract', version: '1.0.1' }
  assert.equal(await publishedArtifactExists(metadata, Buffer.alloc(0), async () => ({ status: 404 })), false)
  await assert.rejects(publishedArtifactExists(metadata, Buffer.alloc(0), async () => ({ status: 503 })), /HTTP 503/)
  await assert.rejects(publishedArtifactExists(metadata, Buffer.alloc(0), async () => { throw new Error('network unavailable') }), /network unavailable/)
})
