import { drizzle } from 'drizzle-orm/d1'
import { Env } from '../types'
import * as schema from './schema'

export function createDB(env: Env) {
  return drizzle(env.DB, { schema })
}

export type DB = ReturnType<typeof createDB>
