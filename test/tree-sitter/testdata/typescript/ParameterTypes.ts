import { defineParameterType } from '@cucumber/cucumber'

defineParameterType({
  name: 'uuid',
  regexp: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
  transformer: (uuid: string) => uuid,
})

defineParameterType({
  name: 'date',
  regexp: /\d{4}-\d{2}-\d{2}/,
  transformer: (name: string) => new Date(name),
})
