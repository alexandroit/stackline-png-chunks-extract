'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const extractChunks = require('../index.js')
const { chunk, generatedPng, png, readmePng } = require('./helpers.cjs')

test('generated README fixture preserves the historical chunk array contract', () => {
  const fixture = readmePng()
  const chunks = extractChunks(fixture)
  assert.deepEqual(chunks.map((entry) => entry.name), ['IHDR', 'IDAT', 'IDAT', 'IDAT', 'IDAT', 'IEND'])
  assert.equal(chunks.length, 6)
  for (const entry of chunks) {
    assert.equal(typeof entry.name, 'string')
    assert(entry.data instanceof Uint8Array)
    assert.equal(Buffer.isBuffer(entry.data), false)
    assert.deepEqual(Object.keys(entry), ['name', 'data'])
  }
  assert.equal(chunks[0].data.length, 13)
  assert.equal(chunks[5].data.length, 0)
})

test('Buffer and Uint8Array inputs produce detached Uint8Array payload copies', () => {
  const fixture = generatedPng()
  const fromTypedArray = extractChunks(fixture)
  const fromBuffer = extractChunks(Buffer.from(fixture))
  assert.deepEqual(fromTypedArray, fromBuffer)
  assert(fromBuffer.every((entry) => entry.data instanceof Uint8Array && !Buffer.isBuffer(entry.data)))
  const before = fromTypedArray[0].data[0]
  fixture[16] ^= 0xff
  assert.equal(fromTypedArray[0].data[0], before)
})

test('historical valid-prefix and error contracts remain recognizable', () => {
  assert.throws(() => extractChunks(Uint8Array.of()), { message: 'Invalid .png file header' })
  const badLineEnding = generatedPng()
  badLineEnding[4] = 0
  assert.throws(() => extractChunks(badLineEnding), { message: 'Invalid .png file header: possibly caused by DOS-Unix line ending conversion?' })
  assert.throws(() => extractChunks(png([chunk('IDAT', []), chunk('IEND', [])])), { message: 'IHDR header missing' })
  const missingEnd = generatedPng().subarray(0, generatedPng().length - 12)
  assert.throws(() => extractChunks(missingEnd), { message: '.png file ended prematurely: no IEND header was found' })
})
