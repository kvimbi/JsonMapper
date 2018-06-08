import mapJson from '../src/TypeMapper';
import {Complex, ComplexArray, Float, Int} from '../src/MappingTypeDefs'
import {UnixTimestampStringDateMapper} from '../src/UnixTimestampStringDateMapper'

const TestType = {
  a: String,
  b: Int,
  c: Date,
  e: Float,
  f: {
    mapper: UnixTimestampStringDateMapper,
  }, // unix time stamp
  g: {
    defaultValue: 'This is a default string value',
  },
  h: {
    exclude: true,
  },
};

describe('Type mapping testing', () => {
  it('maps string correctly ignoring undocumented', () => {
    const result = mapJson({ a: 65 }, TestType, {});
    expect(typeof result === 'object').toBe(true);
    expect(result).toEqual({ a: '65' });
  });

  it('maps int correctly ignoring undocumented', () => {
    const result = mapJson({ b: '65.5' }, TestType, {});
    expect(typeof result === 'object').toBe(true);
    expect(result).toEqual({ b: 65 });
  });

  it('maps string date correctly ignoring undocumented', () => {
    const result = mapJson({ c: '2018-05-14T03:25:20+0100' }, TestType, {});
    expect(typeof result === 'object').toBe(true);
    expect(result).toEqual({ c: new Date('2018-05-14T02:25:20.000Z') });
  });

  it('maps string "true" boolean correctly ignoring undocumented', () => {
    const result = mapJson({ a: 'true' }, { a: Boolean }, {});
    expect(typeof result === 'object').toBe(true);
    expect(result).toEqual({ a: true });
  });

  it('maps string "false" boolean correctly ignoring undocumented', () => {
    const result = mapJson({ a: 'false' }, { a: Boolean }, {});
    expect(typeof result === 'object').toBe(true);
    expect(result).toEqual({ a: false });
  });

  it('maps string "0" boolean correctly ignoring undocumented', () => {
    const result = mapJson({ a: '0' }, { a: Boolean }, {});
    expect(typeof result === 'object').toBe(true);
    expect(result).toEqual({ a: false });
  });

  it('maps number "0" boolean correctly ignoring undocumented', () => {
    const result = mapJson({ a: 0 }, { a: Boolean }, {});
    expect(typeof result === 'object').toBe(true);
    expect(result).toEqual({ a: false });
  });

  it('maps number "1" boolean correctly ignoring undocumented', () => {
    const result = mapJson({ a: 1 }, { a: Boolean }, {});
    expect(typeof result === 'object').toBe(true);
    expect(result).toEqual({ a: true });
  });

  it('maps float number correctly ignoring undocumented', () => {
    const result = mapJson({ e: '56478356348.34543543543534' }, TestType, {});
    expect(typeof result.e).toBe('number');
    expect(result.e).toBe(56478356348.34543543543534);
  });

  it('maps float number correctly changing name ignoring undocumented', () => {
    const result = mapJson(
      { e: '56478356348.34543543543534' },
      { e: { toName: 'voldemort', type: Float } },
      {}
    );
    expect(typeof result.voldemort).toBe('number');
    expect(result).toEqual({ voldemort: 56478356348.34543543543534 });
  });

  it('ignoring undocumented attribute', () => {
    const result = mapJson({ xyz: '56478356348.34543543543534' }, TestType, {});
    expect(result).toEqual({});
  });

  it('including undocumented attribute', () => {
    const result = mapJson({ xyz: '56478356348.34543543543534' }, TestType, {
      includeUndescribed: true,
    });
    expect(result).toEqual({ xyz: '56478356348.34543543543534' });
  });

  it('fills missing values with default null', () => {
    const result = mapJson({}, TestType, { fillMissing: true });
    expect(result).toEqual({
      a: null,
      b: null,
      c: null,
      e: null,
      f: null,
      g: 'This is a default string value',
    });
  });

  it('maps complex object correctly', () => {
    const result = mapJson(
      { a: { b: '1234' } },
      { a: new Complex({ b: Int }) }
    );
    expect(result).toEqual({ a: { b: 1234 } });
  });

  it('maps complex array object correctly', () => {
    const result = mapJson(
      { a: ['1', '2', '3'] },
      {
        a: new ComplexArray(Int),
      }
    );
    expect(result).toEqual({ a: [1, 2, 3] });
  });
});
