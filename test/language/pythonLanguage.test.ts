import assert from 'assert'

import { concatStringLiteral, toStringOrRegExp } from '../../src/language/pythonLanguage.js'

describe('pythonLanguage', () => {
  it('should identify and return regexes correctly', () => {
    // NOTE these are strings that would look like from tree-sitter
    const regexes = ['"Something (.*)"', '"Catch them digits \\d+"']
    regexes.forEach(function (regex) {
      assert(toStringOrRegExp(regex) instanceof RegExp)
    })
  })
  it('should identify normal strings and just return a string', () => {
    const nonregexes = ['"test"']
    nonregexes.forEach(function (nonregex) {
      assert.strictEqual(toStringOrRegExp(nonregex), 'test')
    })
  })
  it('should properly handle concatenated string', () => {
    const concatenatedStrings = [
      '"Airnet Address|Superheat|Gas Pipe Temperature|Liquid Pipe Temperature|EEV Opening|"\\\n        "Return Air Temperature|Room Temperature|Setpoint|Filter|On-Off|Reset Filter Indicator|"\\\n        "Thermostat - LockMode|Thermostat - Lock All|Thermostat - Lock Temperature|Thermostat - Lock On-Off|"\\\n        "Fan Speed|Louver Position|Mode|Group Address|Malfunction Code|Indoor Unit Model Code|"\\\n        "Operation-Stop|Thermostat ON|Capacity Increase|Malfunction Cause|Point_1|Point_2"',
    ]
    const expectedStrings = [
      'Airnet Address|Superheat|Gas Pipe Temperature|Liquid Pipe Temperature|EEV Opening|Return Air Temperature|Room Temperature|Setpoint|Filter|On-Off|Reset Filter Indicator|Thermostat - LockMode|Thermostat - Lock All|Thermostat - Lock Temperature|Thermostat - Lock On-Off|Fan Speed|Louver Position|Mode|Group Address|Malfunction Code|Indoor Unit Model Code|Operation-Stop|Thermostat ON|Capacity Increase|Malfunction Cause|Point_1|Point_2',
    ]
    const z = concatenatedStrings.map((x, i) => [x, expectedStrings[i]]) //use map to zip the concat with expected for assertion
    console.log(concatStringLiteral(expectedStrings[0]))
    z.forEach((x) => assert.strictEqual(concatStringLiteral(x[0]), x[1]))
  })

  it('should strip explicit unicode string prefix', () => {
    const cases = [
      {
        input: 'u"Explicit unicode string"',
        expected: 'Explicit unicode string',
      },
      {
        input: 'u"^Explicit regex unicode string$"',
        expected: '^Explicit regex unicode string$',
      },
    ]

    cases.forEach(({ input, expected }) => {
      assert.strictEqual(toStringOrRegExp(input), expected)
    })
  })
})
