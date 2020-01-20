import fs from 'fs'
import { camelCase as _camelCase } from 'lodash'
import path from 'path'

/**
 * Synchronously determines if a file exists
 *
 * @param file A filepath to check
 */
export const existsFileSync = (file: string): boolean => {
  try {
    fs.accessSync(file, fs.constants.F_OK)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Converts top-level keys of an object to camelCase
 *
 * @param obj An object to convert keys for
 */
export const camelizeKeys = <T extends Object>(obj: T): T => {
  const output: T = {} as T

  Object.keys(obj).forEach(key => {
    output[_camelCase(key)] = obj[key]
  })

  return output
}

/**
 * Exits the process or initiates a listener for an exit event to exit the
 *   process
 *
 * @param lazy If false, exits immediately. If true, initiates a listener on
 *   the process which will exit when an `'exit'` event is encountered.
 * @param code The code the process exits with
 */
export const exit = (lazy: boolean, code: number) => {
  if (lazy) {
    process.on('exit', () => {
      process.exit(code)
    })
  } else {
    process.exit(code)
  }
}

/**
 * Resolves a module path
 *
 * NEEDS CLARIFICATION
 * Not sure exactly how/when/where this is used?
 */
export const resolve = (mod: string): string => {
  const absolute = existsFileSync(mod) || existsFileSync(`${mod}.js`)
  const file = absolute ? path.resolve(mod) : mod
  return file
}

export default { camelizeKeys, exit, resolve }
