'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const extractChunks = require('..')
const crc32 = require('../lib/crc32.js')
const { generatedPng } = require('./helpers.cjs')

test('CommonJS root is the callable default without a wrapper', () => {
  assert.equal(typeof extractChunks, 'function')
  assert.equal(extractChunks.name, 'extractChunks')
  assert.equal(Object.hasOwn(extractChunks, 'default'), false)
  assert.deepEqual(extractChunks(Buffer.from(generatedPng())).map((entry) => entry.name), ['IHDR', 'pHYs', 'tEXt', 'IDAT', 'IEND'])
})

test('internal IEEE CRC-32 matches the canonical check vector and slicing', () => {
  const vector = Buffer.from('123456789')
  assert.equal(crc32(vector), 0xcbf43926)
  assert.equal(crc32(Buffer.from('xx123456789yy'), 2, 11), 0xcbf43926)
  assert.equal(crc32(new Uint8Array(0)), 0)
})
