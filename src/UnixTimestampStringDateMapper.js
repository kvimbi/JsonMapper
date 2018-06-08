//@flow

import type {JsonMapper} from './TypeMapper'

export const UnixTimestampStringDateMapper: JsonMapper = value =>
  new Date(parseInt(value, 10) * 1000);
