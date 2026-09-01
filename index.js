'use strict'

var crc32 = require('./lib/crc32.js')

var MAX_CHUNK_LENGTH = 0x7fffffff

module.exports = extractChunks

function extractChunks(data) {
  if (!isUint8Array(data)) {
    throw new TypeError('Expected input to be a Uint8Array or Buffer')
  }

  validateSignature(data)

  var chunks = []
  var ended = false
  var index = 8

  while (index < data.length) {
    if (data.length - index < 4) {
      throw new Error('.png file ended prematurely: truncated chunk length')
    }

    var dataLength = readUint32(data, index)
    index += 4

    if (dataLength > MAX_CHUNK_LENGTH) {
      throw new RangeError('PNG chunk length exceeds 2147483647 bytes')
    }

    var bytesAfterLength = data.length - index
    if (bytesAfterLength < 4) {
      throw new Error('.png file ended prematurely: truncated chunk type')
    }

    var bytesAfterType = bytesAfterLength - 4
    if (bytesAfterType < dataLength) {
      throw new Error('.png file ended prematurely: truncated chunk data')
    }
    if (bytesAfterType - dataLength < 4) {
      throw new Error('.png file ended prematurely: truncated chunk CRC')
    }

    var typeOffset = index
    var dataOffset = typeOffset + 4
    var dataEnd = dataOffset + dataLength
    var name = String.fromCharCode(
      data[typeOffset],
      data[typeOffset + 1],
      data[typeOffset + 2],
      data[typeOffset + 3]
    )

    if (chunks.length === 0 && name !== 'IHDR') {
      throw new Error('IHDR header missing')
    }
    if (name === 'IEND' && dataLength !== 0) {
      throw new Error('IEND chunk must have zero length')
    }

    var crcActual = readUint32(data, dataEnd)
    var crcExpected = crc32(data, typeOffset, dataEnd)
    if (crcExpected !== crcActual) {
      throw new Error(
        'CRC values for ' + name + ' header do not match, PNG file is likely corrupted'
      )
    }

    var chunkData = new Uint8Array(dataLength)
    chunkData.set(data.subarray(dataOffset, dataEnd))
    chunks.push({ name: name, data: chunkData })

    index = dataEnd + 4
    if (name === 'IEND') {
      ended = true
      break
    }
  }

  if (!ended) {
    throw new Error('.png file ended prematurely: no IEND header was found')
  }

  return chunks
}

function isUint8Array(value) {
  return value !== null &&
    typeof value === 'object' &&
    ArrayBuffer.isView(value) &&
    Object.prototype.toString.call(value) === '[object Uint8Array]'
}

function readUint32(data, offset) {
  return (
    data[offset] * 0x1000000 +
    data[offset + 1] * 0x10000 +
    data[offset + 2] * 0x100 +
    data[offset + 3]
  ) >>> 0
}

function validateSignature(data) {
  if (data[0] !== 0x89) throw new Error('Invalid .png file header')
  if (data[1] !== 0x50) throw new Error('Invalid .png file header')
  if (data[2] !== 0x4e) throw new Error('Invalid .png file header')
  if (data[3] !== 0x47) throw new Error('Invalid .png file header')
  if (data[4] !== 0x0d) throw new Error('Invalid .png file header: possibly caused by DOS-Unix line ending conversion?')
  if (data[5] !== 0x0a) throw new Error('Invalid .png file header: possibly caused by DOS-Unix line ending conversion?')
  if (data[6] !== 0x1a) throw new Error('Invalid .png file header')
  if (data[7] !== 0x0a) throw new Error('Invalid .png file header: possibly caused by DOS-Unix line ending conversion?')
}
