import { GenericParser } from './generic_parser';
import { SubcriptionReq, Subscription } from './interfaces';

export class SubscriptionParser<T> extends GenericParser<T> {
  constructor(xml: Buffer) {
    super(xml);
  }

  subscribe(request: SubcriptionReq): Promise<T | any> {
    return new Promise((resolve, reject) => {
      const response = {};
      let found: Subscription;
      let currentXPath: string;
      this.parser.on('tagOpen', (pTag) => {
        if (currentXPath) {
          currentXPath = currentXPath + '.' + pTag.name;
        } else {
          currentXPath = pTag.name;
        }

        for (const sub of request) {
          if (currentXPath === sub.tag) {
            found = sub;
            return;
          }
        }
      });

      this.parser.on('text', (pText) => {
        if (found) {
          const key = found.name;
          const value = found.converter ? found.converter.convert(pText.contents.trim()) : pText.contents.trim();
          // if element already in the response convert to array
          if (key in response) {
            if (!(response[key] instanceof Array)) {
              response[key] = [response[key]];
            }
            response[key].push(value);
          } else {
            response[key] = value;
          }
        }
      });

      this.parser.on('tagClose', (pTag) => {
        found = null;
        currentXPath = currentXPath.substr(0, currentXPath.lastIndexOf('.'));
      });

      this.parser.on('finish', () => {
        resolve(response);
      });

      this.parser.on('error', (err) => {
        reject(err);
      });

      this.parser.parse(this.xml);
    });
  }
}
