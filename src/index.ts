import { Saxophone } from 'saxophone-ts';

export class GenericSoapParser<T> extends Saxophone {
  private parser: Saxophone;

  constructor(private xml: Buffer) {
    super();
    this.parser = new Saxophone();
  }

  subscribe(request: SubcriptionReq): Promise<T> {
    return new Promise((resolve, reject) => {
      const response: any = {};
      let subscription: Subscription | null;
      this.parser.on('tagOpen', (pTag) => {
        for (const sub of request) {
          if (pTag.name === sub.tag) {
            subscription = sub;
            break;
          }
        }
      });

      this.parser.on('text', (pText) => {
        if (subscription) {
          const key = subscription.name || subscription.tag;
          let newValue: string | object;
          if (subscription.converter) {
            newValue = subscription.converter.convert(pText.contents);
          } else {
            newValue = pText.contents;
          }

          // lets check if key exists in response
          if (key in response) {
            // check if the key is instance of Array
            if (response[key] instanceof Array) {
              // lets add to array
              response[key].push(newValue);
            } else {
              // convert it into an array and then add the new value
              const values = [response[key]];
              values.push(newValue);
              response[key] = values;
            }
          } else {
            // just add it
            response[key] = newValue;
          }
        }
      });

      this.parser.on('tagClose', (pTag) => {
        if (subscription && subscription.tag === pTag.name) {
          subscription = null;
        }
      });

      this.parser.on('finish', () => {
        resolve(response);
      });

      this.parser.on('error', (err) => {
        reject(err);
      });
    });
  }

  parse() {
    return this.parser.parse(this.xml);
  }
}

export interface Converter<T> {
  convert(value: string): T;
}

export type Subscription = {
  tag: string;
  name?: string;
  converter?: Converter<string | object>;
};

export type SubcriptionReq = Subscription[];
