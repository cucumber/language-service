#!/usr/bin/env node

import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

const languages = [
  {
    npm: 'tree-sitter-java',
    dir: '',
    wasm: 'java',
  },
  {
    npm: 'tree-sitter-typescript',
    dir: 'typescript',
    wasm: 'typescript',
  },
  {
    npm: 'tree-sitter-c-sharp',
    dir: '',
    wasm: 'c_sharp',
  },
  {
    npm: 'tree-sitter-php',
    dir: '',
    wasm: 'php',
  },
]

// Build wasm parsers for supported languages
const distDir = 'dist'
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir)
}
for (const { npm, dir, wasm } of languages) {
  const module = path.join('node_modules', npm, dir)

  let command
  if (process.env.CI) {
    console.log(`Compiling ${module}`)
    command = `node_modules/.bin/tree-sitter build-wasm ${module}`
  } else {
    console.log(`Compiling ${module} inside docker`)
    // https://github.com/tree-sitter/tree-sitter/issues/1560
    command = `node_modules/.bin/tree-sitter build-wasm ${module} --docker`
  }
  exec(command, (err) => {
    if (err) {
      console.error('Failed to build wasm for ' + module + ': ' + err.message)
      process.exit(1)
    } else {
      const output = `tree-sitter-${wasm}.wasm`
      const newPath = `${distDir}/${wasm}.wasm`
      fs.rename(output, newPath, (err) => {
        if (err) {
          console.error('Failed to copy built parser: ' + err.message)
          process.exit(1)
        } else console.log(`Successfully compiled ${newPath}`)
      })
    }
  })
}
