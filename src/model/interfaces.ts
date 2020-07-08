export interface Converter<T> {
  convert(value: string): T;
}

export interface Property {
  name: string;
  path: string;
  isAttribute?: boolean;
  toObject?: Converter<any>;
  properties?: Property[];
}

export default interface Subscription {
  name: string;
  path: string;
  toObject?: Converter<any>;
  properties?: Property[];
}
