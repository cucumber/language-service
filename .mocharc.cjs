const fs = require('fs')
const ignore = ['test/language/testdata/**/*']
if (!fs.existsSync('node_modules/tree-sitter-java')) {
  ignore.push('test/language/ExpressionBuilder.test.*')
  ignore.push('test/service/snippet/stepDefinitionSnippet.test.*')
}
module.exports = {
  loader: 'ts-node/esm',
  extension: ['ts'],
  recursive: true,
  ignore: ignore,
}
