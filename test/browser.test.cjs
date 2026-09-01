'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const vm = require('node:vm')
const path = require('node:path')
const { build } = require('esbuild')
const { generatedPng } = require('./helpers.cjs')

test('browser bundle has no Node runtime edge and parses Uint8Array input', async () => {
  const result = await build({
    bundle: true,
    conditions: ['browser'],
    entryPoints: [path.resolve(__dirname, '../index.mjs')],
    format: 'iife',
    globalName: 'StacklinePngChunksExtract',
    platform: 'browser',
    target: ['es2018'],
    write: false
  })
  assert.equal(result.outputFiles.length, 1)
  const source = result.outputFiles[0].text
  assert.doesNotMatch(source, /require\(['"](?:node:)?/)
  assert.doesNotMatch(source, /\b(?:new\s+Buffer|Buffer\.(?:from|alloc|isBuffer)|globalThis\.Buffer)\b/)

  const context = { fixture: Array.from(generatedPng()) }
  vm.runInNewContext(source, context, { filename: 'png-chunks-extract.browser.js' })
  vm.runInNewContext('result = StacklinePngChunksExtract.default(Uint8Array.from(fixture))', context)
  assert.deepEqual(Array.from(context.result, (entry) => entry.name), ['IHDR', 'pHYs', 'tEXt', 'IDAT', 'IEND'])
  assert(context.result.every((entry) => Object.prototype.toString.call(entry.data) === '[object Uint8Array]'))

  context.fixture.pop()
  assert.throws(
    () => vm.runInNewContext('StacklinePngChunksExtract.default(Uint8Array.from(fixture))', context),
    /truncated chunk CRC/
  )
})
