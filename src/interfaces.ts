export interface Converter<T> {
  convert(value: string): T;
}

export type Subscription = {
  tag: string;
  name?: string;
  cdata?: boolean;
  converter?: Converter<string | object>;
};

export type SubscriptionReq = Subscription[];
