import { ParameterType } from '@cucumber/cucumber-expressions'

export function makeKey(parameterType: ParameterType<unknown>): string {
  return parameterType.name || parameterType.regexpStrings.join('|')
}
