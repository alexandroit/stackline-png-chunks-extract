'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const candidate = require('../index.js')
const upstream = require('png-chunks-extract-upstream')
const { chunk, generatedPng, ihdr, normalize, png } = require('./helpers.cjs')

let state = 0x7f4a7c15
function random() {
  state = (Math.imul(state ^ (state >>> 15), 1 | state) + 0x6d2b79f5) | 0
  return (state ^ (state >>> 14)) >>> 0
}

test('generated image and trailing-byte behavior match upstream 1.0.0', () => {
  for (const source of [generatedPng(), Buffer.from(generatedPng())]) {
    assert.deepEqual(normalize(candidate(source)), normalize(upstream(source)))
  }
  const withTrailingBytes = new Uint8Array(generatedPng().length + 7)
  withTrailingBytes.set(generatedPng())
  withTrailingBytes.fill(0xa5, generatedPng().length)
  assert.deepEqual(normalize(candidate(withTrailingBytes)), normalize(upstream(withTrailingBytes)))
})

test('500 deterministic valid chunk streams match the exact upstream package', () => {
  const names = ['tEXt', 'pHYs', 'iTXt', 'zTXt', 'IDAT', 'aaAa']
  for (let iteration = 0; iteration < 500; iteration += 1) {
    const chunks = [ihdr((iteration % 17) + 1, (iteration % 13) + 1)]
    const count = random() % 8
    for (let item = 0; item < count; item += 1) {
      const length = random() % 96
      const payload = new Uint8Array(length)
      for (let index = 0; index < length; index += 1) payload[index] = random() & 0xff
      chunks.push(chunk(names[random() % names.length], payload))
    }
    chunks.push(chunk('IEND', []))
    const fixture = png(chunks)
    assert.deepEqual(normalize(candidate(fixture)), normalize(upstream(fixture)), `fixture ${iteration}`)
  }
})

test('historical errors still match where the hardened boundary is not involved', () => {
  const fixtures = []
  const invalidSignature = generatedPng()
  invalidSignature[2] = 0
  fixtures.push(invalidSignature)
  fixtures.push(png([chunk('IDAT', []), chunk('IEND', [])]))
  const badCrc = generatedPng()
  badCrc[29] ^= 1
  fixtures.push(badCrc)
  fixtures.push(generatedPng().subarray(0, generatedPng().length - 12))

  for (const fixture of fixtures) {
    let candidateError
    let upstreamError
    try { candidate(fixture) } catch (error) { candidateError = error }
    try { upstream(fixture) } catch (error) { upstreamError = error }
    assert(candidateError)
    assert(upstreamError)
    assert.equal(candidateError.message, upstreamError.message)
  }
})

test('hardened IEND CRC behavior intentionally differs from published 1.0.0', () => {
  const fixture = generatedPng()
  const missingIendCrc = fixture.subarray(0, fixture.length - 4)
  assert.equal(upstream(missingIendCrc).at(-1).name, 'IEND')
  assert.throws(() => candidate(missingIendCrc), /truncated chunk CRC/)
})
