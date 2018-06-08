// @flow

export class Int {
  static clsName () {
    return 'Int'
  }

  radix: number

  constructor (radix: number) {
    this.radix = radix
  }
}

export class Float {
  static clsName () {
    return 'Float'
  }

  radix: number

  constructor (radix: number) {
    this.radix = radix
  }
}

export class Complex {
  static clsName () {
    return 'Complex'
  }

  embeddedType: any

  constructor (embeddedType: any) {
    this.embeddedType = embeddedType
  }
}

export class ComplexArray {
  static clsName () {
    return 'ComplexArray'
  }

  embeddedType: any

  constructor (embeddedType: any) {
    this.embeddedType = embeddedType
  }
}
