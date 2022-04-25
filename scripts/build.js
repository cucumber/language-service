#!/usr/bin/env node

import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

const languages = {
  typescript: ['typescript', 'typescript'],
  java: ['java'],
}

// Build wasm parsers for supported languages
const parsersDir = 'dist'
if (!fs.existsSync(parsersDir)) {
  fs.mkdirSync(parsersDir)
}
for (const [lang, names] of Object.entries(languages)) {
  const [moduleName, ...variant] = names
  const module = path.join('node_modules/tree-sitter-' + moduleName, ...variant)
  const output = 'tree-sitter-' + names[names.length - 1] + '.wasm'

  console.log('Compiling ' + lang + ' parser')
  // https://github.com/tree-sitter/tree-sitter/issues/1560
  let command = `node_modules/.bin/tree-sitter build-wasm ${module}`
  exec(command, (err) => {
    if (err) {
      console.error('Failed to build wasm for ' + lang + ': ' + err.message)
      process.exit(1)
    } else {
      const newPath = `${parsersDir}/${lang}.wasm`
      fs.rename(output, newPath, (err) => {
        if (err) {
          console.error('Failed to copy built parser: ' + err.message)
          process.exit(1)
        } else console.log(`Successfully compiled ${newPath}`)
      })
    }
  })
}
