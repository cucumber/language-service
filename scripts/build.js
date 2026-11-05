#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

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

    const grammarDir = module.endsWith('tree-sitter-php') ? path.join(module, 'php') : module
    console.log(`Compiling ${grammarDir}`)
    // Builds run sequentially because the CLI downloads wasi-sdk into a shared cache on first use,
    // and concurrent builds race on extracting it
    try {
      execFileSync(treeSitterCli, ['build', '--wasm', grammarDir], { stdio: 'inherit' })
    } catch (err) {
      console.error(`Failed to build wasm for ${module}: ${err.message}`)
      process.exit(1)
    }
    const newPath = `${distDir}/${wasm}.wasm`
    fs.renameSync(`tree-sitter-${wasm}.wasm`, newPath)
    console.log(`Successfully compiled ${newPath}`)
  }
}
