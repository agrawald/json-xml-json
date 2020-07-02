import { Converter } from '../model/interfaces';
const jsonParser = require('fast-json-parse');

export default class JsonConverter implements Converter<object> {
  convert(value: string): object {
    const result = jsonParser(value);
    if (result.err) {
      throw result.err;
    }
    return result.value;
  }
}
