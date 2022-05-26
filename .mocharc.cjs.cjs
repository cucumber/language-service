const fs = require('fs')
const ignore = ['dist/cjs/test/language/testdata/**/*']
if (!fs.existsSync('node_modules/tree-sitter-java')) {
  ignore.push('dist/cjs/test/language/ExpressionBuilder.test.*')
  ignore.push('dist/cjs/test/service/snippet/stepDefinitionSnippet.test.*')
}
module.exports = {
  extension: ['js'],
  recursive: true,
  ignore: ignore,
}
