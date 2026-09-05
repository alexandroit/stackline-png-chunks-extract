import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { appendFile, readFile } from 'node:fs/promises'
import { publishedArtifactExists } from './registry-requests.mjs'

const archive = process.argv[2]
const metadata = JSON.parse(execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' }))
assert.equal(metadata.name, '@stackline/png-chunks-extract')
const published = await publishedArtifactExists(metadata, await readFile(archive))
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `published=${published}\n`)
console.log(published ? 'Exact artifact already exists on npm; verification only.' : 'Version is absent from npm; publication is required.')
