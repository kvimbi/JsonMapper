// @flow

import {Int, Complex, ComplexArray} from './MappingTypeDefs'

export type JsonMapper = (value: any) => any;

/**
 * Mapping options for defined json parameter
 * @param toName - new name in target json object
 * @param type - mapping type (ie. Int, Float, Complex, ComplexArray)
 * @param mapper - custom mapper function
 * @param defaultValue - default value to use when the attribute is missing in source json object. Alse see {@link OptionsType#fillMissing}
 * @param exclude - excludes this attribute from mapping even if {@link OptionsType#fillMissing} is true
 */
export type MappingOptionsType = {
  toName?: string, // new name in json object
  type?: any,
  mapper?: JsonMapper, // json mapper function to use
  defaultValue?: any,
  exclude?: boolean,
  forceInclude?: boolean,
};

/**
 * General mapping options
 * @param includeUndescribed - ncludes also attributes not specified in mapping description toType
 * @param fillMissing - *Default TRUE*, adds missing values as undefined or as defined in {@link MappingOptionsType#defaultValue}
 */
export type OptionsType = {
  includeUndescribed?: boolean, // includes also attributes not specified in toType
  fillMissing?: boolean, // add missing values as null
};

export type MappingTypeType = { [key: string]: MappingOptionsType | Function };

const MappingCodetable: { [any]: (value: any, type: any, options: OptionsType) => any } = {
  String: value => (value === null ? null : String(value)),
  Int: (value, type: Int) =>
    value === undefined || value === null
      ? value
      : parseInt(value, type.radix || 10),
  Float: value =>
    value === undefined || value === null
      ? value
      : parseFloat(value) || value,
  Boolean: value => (value === 'false' || value === '0' ? false : !!value),
  Date: value => new Date(value),
  Complex: (value: any, type: Complex, options: OptionsType) =>
    mapJson(value, type.embeddedType, options),
  ComplexArray: (value: Array<any>, type: ComplexArray, options: OptionsType) =>
    value.map
      ? value.map(item => mapJson(item, type.embeddedType, options))
      : value,
}

function _getClassName (cls: any): string {
  if (!cls) {
    return ''
  }

  return cls.clsName
    ? cls.clsName()
    : cls.constructor.clsName ? cls.constructor.clsName() : cls.name
}

/**
 * Maps json object to another one using mapping definition of `toType`.
 * For mapping options see {@link MappingOptionsType} and {@link OptionsType}
 *
 * @param json: any
 * @param toType: MappingTypeType
 * @param options: OptionsType
 * @returns {*}
 *
 * @see MappingTypeType
 * @see OptionsType
 */
export default function mapJson (
  json: any,
  toType: MappingTypeType,
  options: OptionsType = {fillMissing: true},
) {
  if (json === undefined || json === null) {
    return json
  }

  if (Array.isArray(json) && _getClassName(toType) === 'ComplexArray') {
    return MappingCodetable['ComplexArray'](json, toType, options)
  } else if (typeof json === 'object') {
    // mapping json objects
    const resultJson = Object.create(null) // create empty json object
    Object.keys(json).forEach(key => {
      if (toType[key] || options.includeUndescribed) {
        if (toType[key] && toType[key].exclude) {
          return
        }
        const mappingKey =
          typeof toType[key] === 'object' ? toType[key].toName || key : key
        const mapper =
          typeof toType[key] === 'object' &&
          (toType[key].mapper || toType[key].type)
            ? MappingCodetable[_getClassName((toType[key] || {}).type)] ||
            toType[key].mapper
            : MappingCodetable[_getClassName(toType[key] || {})]

        resultJson[mappingKey] = mapper
          ? mapper(json[key], toType[key].type || toType[key], options)
          : json[key]
      }
    })

    Object.keys(toType).forEach(typeKey => {
      const propName = toType[typeKey].toName || typeKey
      if (options.fillMissing || toType[typeKey].forceInclude) {
        if (resultJson[propName] === undefined) {
          if (toType[typeKey].exclude) {
            return
          }

          if (typeof toType[typeKey] === 'object') {
            resultJson[propName] =
              typeof toType[typeKey].defaultValue === 'function'
                ? toType[typeKey].defaultValue.bind(resultJson)
                : toType[typeKey].defaultValue === undefined ? null : toType[typeKey].defaultValue
          } else {
            resultJson[propName] = null
          }
        }
      }
    })

    return resultJson
  } else {
    // mapping primitive types
    const mapper =
      typeof toType === 'object' && (toType.mapper || toType.type)
        ? MappingCodetable[_getClassName((toType || {}).type)] || toType.mapper
        : MappingCodetable[_getClassName(toType || {})]
    return mapper ? mapper(json, toType, options) : json
  }
}
