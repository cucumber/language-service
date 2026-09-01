import { readFileSync } from 'fs'
import { createRequire } from 'module'
import { dirname, resolve } from 'path'

// Load tree-sitter-clojure via node-gyp-build since its index.js uses ESM top-level await
// which is incompatible with this project's tree-sitter@0.21.1
function loadClojure() {
  try {
    const req = createRequire(resolve(process.cwd(), '__placeholder.js'))
    const pkgPath = req.resolve('@yogthos/tree-sitter-clojure/package.json')
    const root = dirname(pkgPath)
    const binding = req('node-gyp-build')(root)
    binding.name = 'clojure'
    try {
      binding.nodeTypeInfo = JSON.parse(
        readFileSync(resolve(root, 'src', 'node-types.json'), 'utf8')
      )
    } catch (_) {
      // nodeTypeInfo is optional
    }
    return binding
  } catch (_) {
    return undefined
  }
}

export default loadClojure()
