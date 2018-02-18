// @flow

/**
 * Flow type definitions
 */
export type JsonMapper = (value: any) => any;

export type MappingOptionsType = {
  toName?: string, // new name in json object
  type: any,
  mapper?: JsonMapper, // json mapper function to use
  defaultValue?: any,
  exclude?: boolean,
};

export type OptionsType = {
  includeUndescribed?: boolean, // includes also attributes not specified in toType
  fillMissing?: boolean, // add missing values as null (todo: undefined?)
};

export type MappingTypeType = { [key: string]: MappingOptionsType | Function };


/**
 * Mapping type definitions
 */
export class Int {
  static get name() {
    return 'Int';
  };

  radix: number;
  constructor(radix: number) {
    this.radix = radix;
  }
}
export class Float {
  static get name() {
    return 'Float';
  };

  radix: number;

  constructor(radix: number) {
    this.radix = radix;
  }
}
export class Complex {
  static get name() {
    return 'Complex';
  }
  get name() {
    return Complex.name;
  };

  embeddedType: any;

  constructor(embeddedType: any) {
    this.embeddedType = embeddedType;
  }
}
export class ComplexArray {
  static get name() {
    return 'ComplexArray';
  }
  get name() {
    return ComplexArray.name;
  };

  embeddedType: any;

  constructor(embeddedType: any) {
    this.embeddedType = embeddedType;
  }
}


/**
 * Mapping code table.
 * Defines function for each mapping type on how
 * to perform actual mapping of the value
 *
 * @type {{String: function(*=): *, Int: function(*=, Int): number, Float: function(*=): *, Boolean: function(*=): boolean, Date: function(*=): Date, BigNumber: function(*=): *, Complex: function(any, Complex, OptionsType), ComplexArray: function(Array, ComplexArray, OptionsType): any[]}}
 */
const MappingCodetable: {[string]: Function} = {
  String: value => (value === null ? null : String(value)),
  'Int': (value, type: Int) =>
    value === undefined || value === null
      ? value
      : parseInt(value, type.radix || 10),
  'Float': value =>
    value === undefined || value === null
      ? value
      : parseFloat(value, 10) || value,
  'Boolean': value => (value === 'false' || value === '0' ? false : !!value),
  'Date': value => new Date(value),
  'BigNumber': value =>
    value === null || value === undefined ? value : new BigNumber(value),
  'Complex': (value: any, type: Complex, options: OptionsType) =>
    mapJson(value, type.embeddedType, options),
  'ComplexArray': (value: Array, type: ComplexArray, options: OptionsType) =>
    value.map(item => mapJson(item, type.embeddedType, options)),
};

/**
 * Custom mapping function
 * @param value
 * @returns {Date}
 * @constructor
 */
export const UnixTimestampStringDateMapper: JsonMapper = value =>
  new Date(parseInt(value, 10) * 1000);

function _getClassName(cls) {
  if (!cls) {
    return;
  }
  return cls.name;
}

export default function mapJson(
  json: any,
  toType: MappingTypeType,
  options: OptionsType = {}
) {
  if (json === undefined || json === null) {
    return json;
  }

  // mapping json objects
  if (typeof json === 'object') {
    const resultJson = Object.create(null); // create empty json object
    Object.keys(json).forEach(key => {
      if (toType[key] || options.includeUndescribed) {
        if (toType[key] && toType[key].exclude) {
          return;
        }
        const mappingKey =
          typeof toType[key] === 'object' ? toType[key].toName || key : key;
        const mapper =
          typeof toType[key] === 'object' &&
          (toType[key].mapper || toType[key].type)
            ? MappingCodetable[_getClassName((toType[key] || {}).type)] ||
              toType[key].mapper
            : MappingCodetable[_getClassName(toType[key] || {})];
        if (!mapper) {
          console.warn('Missing mapper for type mapping! Mapping key: %O, mapping options: %O', mappingKey, toType[key]);
        }
        resultJson[mappingKey] = mapper
          ? mapper(json[key], toType[key], options)
          : json[key];
      }
    });

    if (options.fillMissing) {
      Object.keys(toType).forEach(typeKey => {
        if (!resultJson[typeKey]) {
          if (toType[typeKey].exclude) {
            return;
          }
          resultJson[typeKey] =
            typeof toType[typeKey] === 'object'
              ? toType[typeKey].defaultValue || null
              : null;
        }
      });
    }

    return resultJson;
  } else {
    // mapping primitive types
    const mapper =
      typeof toType === 'object' && (toType.mapper || toType.type)
        ? MappingCodetable[_getClassName((toType || {}).type)] || toType.mapper
        : MappingCodetable[_getClassName(toType || {})];
    return mapper ? mapper(json, toType, options) : json;
  }
}
