import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'

export async function retryAttestationAudit(operation, { attempts = 24, wait = () => delay(5_000) } = {}) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      const diagnostic = `${error.stderr || ''}\n${error.stdout || ''}`
      const pending = /\bE404\b/.test(diagnostic) &&
        diagnostic.includes('GET https://registry.npmjs.org/-/npm/v1/attestations/')
      if (!pending || attempt === attempts - 1) throw error
      console.log('npm attestation is still propagating; retrying signature verification.')
      await wait()
    }
  }
}

export async function publishedArtifactExists(metadata, bytes, fetcher = globalThis.fetch) {
  const response = await fetcher(`https://registry.npmjs.org/${encodeURIComponent(metadata.name)}/${metadata.version}`,
    { signal: globalThis.AbortSignal.timeout(30_000) })
  if (response.status === 404) return false
  assert(response.ok, `registry status check failed: HTTP ${response.status}`)
  const official = await response.json()
  assert.equal(official.name, metadata.name)
  assert.equal(official.version, metadata.version)
  assert.equal(official.dist.integrity, `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
    'published version differs from the CI artifact; never replace it')
  const url = new URL(official.dist.tarball)
  assert.equal(url.origin, 'https://registry.npmjs.org')
  const archive = await fetcher(url, { signal: globalThis.AbortSignal.timeout(30_000) })
  assert(archive.ok, `registry tarball check failed: HTTP ${archive.status}`)
  assert(bytes.equals(Buffer.from(await archive.arrayBuffer())), 'published tarball bytes differ from CI')
  return true
}
