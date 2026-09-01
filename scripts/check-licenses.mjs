import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const license = await readFile(new URL('../LICENSE', import.meta.url), 'utf8')
const notice = await readFile(new URL('../NOTICE', import.meta.url), 'utf8')
const thirdParty = await readFile(new URL('../THIRD_PARTY_LICENSES.md', import.meta.url), 'utf8')
const source = await readFile(new URL('../lib/crc32.js', import.meta.url), 'utf8')

assert.match(license, /Copyright \(c\) 2015 Hugh Kennedy/)
assert.match(license, /Copyright \(c\) 2026 Stackline maintainers/)
assert.match(license, /Permission is hereby granted, free of charge/)
assert.match(notice, /not affiliated with or endorsed/i)
assert.match(thirdParty, /zero runtime, optional, peer, and bundled\s+dependencies/i)
assert.match(thirdParty, /png-chunks-extract@1\.0\.0/)
assert.match(thirdParty, /No crc-32 source code is included/)
assert.doesNotMatch(source, /require\(['"]crc-32['"]\)/)

console.log('Upstream MIT attribution and independent internal CRC implementation checks passed.')
