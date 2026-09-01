import assert from 'node:assert/strict'
import extractChunks from '../index.mjs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const commonjs = require('../index.js')
const { generatedPng } = require('./helpers.cjs')

assert.equal(extractChunks, commonjs)
assert.equal(typeof extractChunks, 'function')
assert.deepEqual(extractChunks(generatedPng()).map((entry) => entry.name), ['IHDR', 'pHYs', 'tEXt', 'IDAT', 'IEND'])
console.log('Native ESM default matches the callable CommonJS export.')
