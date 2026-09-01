'use strict'

const assert = require('node:assert/strict')
const zlib = require('node:zlib')
const CRC32 = require('crc-32')

const SIGNATURE = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function bytes(value) {
  return value instanceof Uint8Array ? value : Uint8Array.from(value || [])
}

function concat(parts) {
  const size = parts.reduce((total, part) => total + part.length, 0)
  const result = new Uint8Array(size)
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }
  return result
}

function uint32(value) {
  return Uint8Array.from([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff
  ])
}

function chunk(name, payload, options) {
  assert.equal(name.length, 4)
  const data = bytes(payload)
  const type = Uint8Array.from(Array.from(name, (character) => character.charCodeAt(0)))
  const body = concat([type, data])
  const crc = options && options.crc !== undefined ? options.crc >>> 0 : CRC32.buf(body) >>> 0
  const length = options && options.length !== undefined ? options.length >>> 0 : data.length
  return concat([uint32(length), type, data, uint32(crc)])
}

function png(chunks, trailing) {
  return concat([SIGNATURE, ...chunks, bytes(trailing)])
}

function ihdr(width, height) {
  return chunk('IHDR', concat([
    uint32(width || 1),
    uint32(height || 1),
    Uint8Array.from([8, 6, 0, 0, 0])
  ]))
}

function generatedPng() {
  const raw = Buffer.from([0, 0x22, 0x66, 0xaa, 0xff])
  return png([
    ihdr(1, 1),
    chunk('pHYs', concat([uint32(3780), uint32(3780), Uint8Array.of(1)])),
    chunk('tEXt', Buffer.from('Comment\0generated fixture', 'latin1')),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', [])
  ])
}

function readmePng() {
  let state = 0x4d595df4
  const raw = Buffer.alloc(1 + 128 * 128 * 4)
  for (let index = 1; index < raw.length; index += 1) {
    state = (Math.imul(state ^ (state >>> 15), 1 | state) + 0x6d2b79f5) | 0
    raw[index] = state >>> 24
  }
  const compressed = zlib.deflateSync(raw)
  const parts = []
  for (let index = 0; index < 4; index += 1) {
    const start = Math.floor(compressed.length * index / 4)
    const end = Math.floor(compressed.length * (index + 1) / 4)
    parts.push(chunk('IDAT', compressed.subarray(start, end)))
  }
  return png([ihdr(128, 128), ...parts, chunk('IEND', [])])
}

function normalize(chunks) {
  return chunks.map((entry) => ({ name: entry.name, data: Array.from(entry.data) }))
}

module.exports = {
  SIGNATURE,
  chunk,
  concat,
  generatedPng,
  ihdr,
  normalize,
  png,
  readmePng,
  uint32
}
