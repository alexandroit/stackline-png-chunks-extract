'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const path = require('node:path')
const extractChunks = require('../index.js')
const { SIGNATURE, chunk, concat, generatedPng, ihdr, png, uint32 } = require('./helpers.cjs')

test('only Buffer and Uint8Array inputs are accepted', () => {
  for (const value of [null, undefined, [], {}, 'png', new Uint16Array(4), new DataView(new ArrayBuffer(8))]) {
    assert.throws(() => extractChunks(value), {
      name: 'TypeError',
      message: 'Expected input to be a Uint8Array or Buffer'
    })
  }
})

test('all signature positions retain deterministic historical messages', () => {
  const fixture = generatedPng()
  for (let index = 0; index < 8; index += 1) {
    const changed = fixture.slice()
    changed[index] ^= 0xff
    const lineEnding = index === 4 || index === 5 || index === 7
    assert.throws(() => extractChunks(changed), {
      message: lineEnding
        ? 'Invalid .png file header: possibly caused by DOS-Unix line ending conversion?'
        : 'Invalid .png file header'
    })
  }
})

test('each incomplete chunk field has one stable boundary error', () => {
  for (let lengthBytes = 1; lengthBytes <= 3; lengthBytes += 1) {
    assert.throws(() => extractChunks(concat([SIGNATURE, new Uint8Array(lengthBytes)])), /truncated chunk length/)
  }
  for (let typeBytes = 0; typeBytes <= 3; typeBytes += 1) {
    assert.throws(() => extractChunks(concat([SIGNATURE, uint32(0), new Uint8Array(typeBytes)])), /truncated chunk type/)
  }
  for (let dataBytes = 0; dataBytes <= 2; dataBytes += 1) {
    assert.throws(() => extractChunks(concat([SIGNATURE, uint32(3), Buffer.from('IHDR'), new Uint8Array(dataBytes)])), /truncated chunk data/)
  }
  for (let crcBytes = 0; crcBytes <= 3; crcBytes += 1) {
    assert.throws(() => extractChunks(concat([SIGNATURE, uint32(1), Buffer.from('IHDR'), Uint8Array.of(0), new Uint8Array(crcBytes)])), /truncated chunk CRC/)
  }
})

test('declared lengths are bounded before payload allocation or iteration', () => {
  const tooLarge = concat([SIGNATURE, uint32(0x80000000), Buffer.from('IHDR')])
  assert.throws(() => extractChunks(tooLarge), {
    name: 'RangeError',
    message: 'PNG chunk length exceeds 2147483647 bytes'
  })

  const maximumButAbsent = concat([SIGNATURE, uint32(0x7fffffff), Buffer.from('IHDR')])
  assert.throws(() => extractChunks(maximumButAbsent), /truncated chunk data/)

  const source = [
    "const extract=require('./index.js')",
    "const Native=Uint8Array",
    "const input=Native.from([137,80,78,71,13,10,26,10,0,15,66,64,73,72,68,82])",
    "let largest=0",
    "global.Uint8Array=class GuardedUint8Array extends Native{constructor(value){if(typeof value==='number')largest=Math.max(largest,value);super(value)}}",
    "try{extract(input);process.exitCode=2}catch(error){if(error.message!=='.png file ended prematurely: truncated chunk data')throw error}",
    "if(largest!==0)process.exitCode=3"
  ].join(';')
  const result = spawnSync(process.execPath, ['-e', source], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
    timeout: 2000
  })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.signal, null)
})

test('CRC is validated for every chunk including zero-length IEND', () => {
  const invalidDataCrc = png([ihdr(), chunk('tEXt', [1, 2, 3], { crc: 0 }), chunk('IEND', [])])
  assert.throws(() => extractChunks(invalidDataCrc), /CRC values for tEXt header do not match/)

  const invalidIendCrc = png([ihdr(), chunk('IEND', [], { crc: 0 })])
  assert.throws(() => extractChunks(invalidIendCrc), /CRC values for IEND header do not match/)

  const missingIendCrc = generatedPng().subarray(0, generatedPng().length - 4)
  assert.throws(() => extractChunks(missingIendCrc), /truncated chunk CRC/)
})

test('IEND must be empty, IHDR must be first, and IEND must exist', () => {
  assert.throws(() => extractChunks(png([ihdr(), chunk('IEND', [1])])), {
    message: 'IEND chunk must have zero length'
  })
  assert.throws(() => extractChunks(png([chunk('tEXt', []), chunk('IEND', [])])), {
    message: 'IHDR header missing'
  })
  assert.throws(() => extractChunks(png([ihdr()])), {
    message: '.png file ended prematurely: no IEND header was found'
  })
})

test('valid IEND keeps the historical trailing-byte behavior', () => {
  const fixture = concat([generatedPng(), uint32(1), Buffer.from('tEXt')])
  assert.deepEqual(extractChunks(fixture).map((entry) => entry.name), ['IHDR', 'pHYs', 'tEXt', 'IDAT', 'IEND'])
})
