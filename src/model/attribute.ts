import { Converter } from './interfaces';

export default class Attribute {
  name: string;
  path: string;
  toObject?: Converter<any>;
}
