import { GraphQLScalarType, Kind } from 'graphql'

// Time scalar for ISO 8601 datetime strings
export const TimeScalar = new GraphQLScalarType({
  name: 'Time',
  description: 'ISO 8601 datetime string',
  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString()
    }
    if (typeof value === 'string') {
      return value
    }
    if (typeof value === 'number') {
      return new Date(value * 1000).toISOString()
    }
    throw new TypeError(`Time cannot represent value: ${value}`)
  },
  parseValue(value: unknown): Date {
    if (typeof value !== 'string') {
      throw new TypeError(`Time cannot represent non-string value: ${value}`)
    }
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      throw new TypeError(`Time cannot represent invalid date string: ${value}`)
    }
    return date
  },
  parseLiteral(ast): Date {
    if (ast.kind !== Kind.STRING) {
      throw new TypeError(`Time cannot represent non-string value: ${ast.kind}`)
    }
    const date = new Date(ast.value)
    if (isNaN(date.getTime())) {
      throw new TypeError(`Time cannot represent invalid date string: ${ast.value}`)
    }
    return date
  },
})

// Cursor scalar for pagination
export const CursorScalar = new GraphQLScalarType({
  name: 'Cursor',
  description: 'Base64 encoded cursor for pagination',
  serialize(value: unknown): string {
    if (typeof value === 'string') {
      return value
    }
    return JSON.stringify(value)
  },
  parseValue(value: unknown): string {
    if (typeof value !== 'string') {
      throw new TypeError(`Cursor cannot represent non-string value: ${value}`)
    }
    return value
  },
  parseLiteral(ast): string {
    if (ast.kind !== Kind.STRING) {
      throw new TypeError(`Cursor cannot represent non-string value: ${ast.kind}`)
    }
    return ast.value
  },
})
