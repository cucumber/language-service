const fs = require('node:fs')
const ignore = ['test/language/testdata/**/*']
if (!fs.existsSync('dist/java.wasm')) {
  ignore.push('test/language/ExpressionBuilder.test.*')
  ignore.push('test/service/snippet/stepDefinitionSnippet.test.*')
}
module.exports = {
  'node-option': ['import=tsx'],
  extension: ['ts'],
  recursive: true,
  ignore: ignore,
}
