'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const extractChunks = require('../index.js')
const { SIGNATURE, chunk, concat, ihdr, png, uint32 } = require('./helpers.cjs')

test('20,000 chunks are parsed iteratively and in order', () => {
  const entries = [ihdr()]
  for (let index = 0; index < 20000; index += 1) entries.push(chunk('aaAa', []))
  entries.push(chunk('IEND', []))
  const chunks = extractChunks(png(entries))
  assert.equal(chunks.length, 20002)
  assert.equal(chunks[0].name, 'IHDR')
  assert.equal(chunks[10000].name, 'aaAa')
  assert.equal(chunks.at(-1).name, 'IEND')
})

test('an 8 MiB payload is copied exactly after validation', () => {
  const payload = new Uint8Array(8 * 1024 * 1024)
  for (let index = 0; index < payload.length; index += 4096) payload[index] = (index >>> 12) & 0xff
  const chunks = extractChunks(png([ihdr(), chunk('IDAT', payload), chunk('IEND', [])]))
  assert.equal(chunks[1].data.length, payload.length)
  assert.equal(chunks[1].data[4096 * 127], 127)
  assert.notEqual(chunks[1].data.buffer, payload.buffer)
})

test('10,000 huge declarations fail in bounded time', () => {
  const input = concat([SIGNATURE, uint32(0x7fffffff), Buffer.from('IHDR')])
  const started = Date.now()
  for (let iteration = 0; iteration < 10000; iteration += 1) {
    assert.throws(() => extractChunks(input), /truncated chunk data/)
  }
  assert(Date.now() - started < 5000)
})
