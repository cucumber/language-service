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
    dir: 'tsx',
    wasm: 'tsx',
  },
  {
    npm: 'tree-sitter-c-sharp',
    dir: '',
    wasm: 'c_sharp',
  },
  {
    npm: 'tree-sitter-php',
    dir: 'php',
    wasm: 'php',
  },
  {
    npm: 'tree-sitter-ruby',
    dir: '',
    wasm: 'ruby',
  },
  {
    npm: 'tree-sitter-python',
    dir: '',
    wasm: 'python',
  },
  {
    npm: 'tree-sitter-rust',
    dir: '',
    wasm: 'rust',
  },
  {
    npm: 'tree-sitter-go',
    dir: '',
    wasm: 'go',
  },
  {
    npm: 'tree-sitter-scala',
    dir: '',
    wasm: 'scala',
  },
  {
    npm: 'tree-sitter-clojure',
    dir: '',
    wasm: 'clojure'
  }
]

// Build wasm parsers for supported languages
const distDir = 'dist'
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir)
}
const treeSitterCli = path.join('node_modules', '.bin', 'tree-sitter')
if (!fs.existsSync(treeSitterCli)) {
  console.info(`Skipping compilation of tree-sitter wasms - ${treeSitterCli} is not installed`)
} else {
  for (const { npm, dir, wasm } of languages) {
    const module = path.join('node_modules', npm, dir)

    if (!fs.existsSync(module)) {
      console.error(
        `Module ${module} does not exist. This is likely due to an installation and/or build failure of the module. Please check the logs.`
      )
      process.exit(1)
    }

    let command
    if (process.env.CI) {
      console.log(`Compiling ${module}`)
      if (module.endsWith('tree-sitter-php')) {
        command = `node_modules/.bin/tree-sitter build --wasm ${module}/php`
      } else {
        command = `node_modules/.bin/tree-sitter build --wasm ${module}`
      }
    } else {
      console.log(`Compiling ${module} inside docker`)
      // https://github.com/tree-sitter/tree-sitter/issues/1560
      if (module.endsWith('tree-sitter-php')) {
        command = `node_modules/.bin/tree-sitter build --wasm ${module}/php --docker`
      } else {
        command = `node_modules/.bin/tree-sitter build --wasm ${module} --docker`
      }
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
}
