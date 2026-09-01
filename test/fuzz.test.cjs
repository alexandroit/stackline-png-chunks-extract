'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const extractChunks = require('../index.js')
const upstream = require('png-chunks-extract-upstream')
const { SIGNATURE, chunk, concat, ihdr, normalize, png } = require('./helpers.cjs')

let state = 0x243f6a88
function random() {
  state ^= state << 13
  state ^= state >>> 17
  state ^= state << 5
  return state >>> 0
}

function outcome(input) {
  try {
    return { ok: true, value: normalize(extractChunks(input)) }
  } catch (error) {
    return { ok: false, name: error.name, message: error.message }
  }
}

test('2,000 malformed byte streams terminate and fail deterministically', () => {
  for (let iteration = 0; iteration < 2000; iteration += 1) {
    const length = random() % 160
    const body = new Uint8Array(length)
    for (let index = 0; index < length; index += 1) body[index] = random() & 0xff
    const input = iteration % 2 === 0 ? concat([SIGNATURE, body]) : body
    assert.deepEqual(outcome(input), outcome(input), `deterministic outcome ${iteration}`)
  }
})

test('750 valid randomized streams remain upstream-identical', () => {
  const names = ['tEXt', 'zTXt', 'iTXt', 'pHYs', 'IDAT', 'abCd']
  for (let iteration = 0; iteration < 750; iteration += 1) {
    const entries = [ihdr((random() % 1024) + 1, (random() % 1024) + 1)]
    const count = random() % 12
    for (let item = 0; item < count; item += 1) {
      const payload = new Uint8Array(random() % 128)
      for (let index = 0; index < payload.length; index += 1) payload[index] = random() & 0xff
      entries.push(chunk(names[random() % names.length], payload))
    }
    entries.push(chunk('IEND', []))
    const input = png(entries)
    assert.deepEqual(normalize(extractChunks(input)), normalize(upstream(input)), `valid fuzz ${iteration}`)
  }
})

test('single-bit corruption never produces a nondeterministic result', () => {
  const input = png([ihdr(), chunk('tEXt', Buffer.from('fuzz\0payload')), chunk('IEND', [])])
  for (let index = 0; index < input.length; index += 1) {
    const changed = input.slice()
    changed[index] ^= 1 << (index % 8)
    assert.deepEqual(outcome(changed), outcome(changed), `bit flip ${index}`)
  }
})
