'use strict'

var POLYNOMIAL = 0xedb88320
var table = new Uint32Array(256)

for (var byte = 0; byte < table.length; byte += 1) {
  var remainder = byte
  for (var bit = 0; bit < 8; bit += 1) {
    remainder = remainder & 1
      ? (remainder >>> 1) ^ POLYNOMIAL
      : remainder >>> 1
  }
  table[byte] = remainder >>> 0
}

module.exports = crc32

function crc32(data, start, end) {
  var crc = 0xffffffff
  for (var index = start || 0; index < (end === undefined ? data.length : end); index += 1) {
    crc = (table[(crc ^ data[index]) & 0xff] ^ (crc >>> 8)) >>> 0
  }
  return (crc ^ 0xffffffff) >>> 0
}
