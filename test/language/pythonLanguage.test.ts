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
      assert(toStringOrRegExp(nonregex) == 'test')
    })
  })
  it('should properly handle concatanated string', () => {
    const concatedStrings = [
      '"Airnet Address|Superheat|Gas Pipe Temperature|Liquid Pipe Temperature|EEV Opening|"\\\n        "Return Air Temperature|Room Temperature|Setpoint|Filter|On-Off|Reset Filter Indicator|"\\\n        "Thermostat - LockMode|Thermostat - Lock All|Thermostat - Lock Temperature|Thermostat - Lock On-Off|"\\\n        "Fan Speed|Louver Position|Mode|Group Address|Malfunction Code|Indoor Unit Model Code|"\\\n        "Operation-Stop|Thermostat ON|Capacity Increase|Malfunction Cause|Point_1|Point_2"',
    ]
    const expectedStrings = [
      'Airnet Address|Superheat|Gas Pipe Temperature|Liquid Pipe Temperature|EEV Opening|Return Air Temperature|Room Temperature|Setpoint|Filter|On-Off|Reset Filter Indicator|Thermostat - LockMode|Thermostat - Lock All|Thermostat - Lock Temperature|Thermostat - Lock On-Off|Fan Speed|Louver Position|Mode|Group Address|Malfunction Code|Indoor Unit Model Code|Operation-Stop|Thermostat ON|Capacity Increase|Malfunction Cause|Point_1|Point_2',
    ]
    const z = concatedStrings.map((x, i) => [x, expectedStrings[i]]) //use map to zip the concat with expected for assertion
    console.log(concatStringLiteral(expectedStrings[0]))
    z.forEach((x) => assert(concatStringLiteral(x[0]) == x[1]))
  })
})
