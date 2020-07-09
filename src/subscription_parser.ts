import { Saxophone } from 'saxophone-ts';
import { Subscription, SubscriptionReq } from './interfaces';
import { TagOpenNode, TagCloseNode, TextNode } from 'saxophone-ts/dist/types/src/static/nodes';

export class SubscriptionParser<T> {
  private parser: Saxophone;
  private readonly response = {};
  private found: Subscription;
  private currentXPath: string;
  private request: SubscriptionReq;

  constructor() {
    this.parser = new Saxophone();
    this.parser.on('tagOpen', this.onTagOpen.bind(this));
    this.parser.on('tagClose', this.onTagClose.bind(this));
    this.parser.on('text', this.onTextOrCdata.bind(this));
    this.parser.on('cdata', this.onTextOrCdata.bind(this));
  }

  private _cleanTagName(tagName: string): string {
    return tagName.split(':').reverse()[0];
  }

  private onTagOpen(tag: TagOpenNode): void {
    const tagName = this._cleanTagName(tag.name);
    if (this.currentXPath) {
      this.currentXPath = this.currentXPath + '.' + tagName;
    } else {
      this.currentXPath = tagName;
    }

    for (const sub of this.request) {
      if (this.currentXPath === sub.tag) {
        this.found = sub;
        return;
      }
    }
  }

  private onTagClose(tag: TagCloseNode): void {
    this.found = null;
    this.currentXPath = this.currentXPath.substr(0, this.currentXPath.lastIndexOf('.'));
  }

  private onTextOrCdata(text: TextNode): void {
    if (this.found) {
      const key = this.found.name;
      const value = this.found.converter ? this.found.converter.convert(text.contents.trim()) : text.contents.trim();
      // if element already in the response convert to array
      if (key in this.response) {
        if (!(this.response[key] instanceof Array)) {
          this.response[key] = [this.response[key]];
        }
        this.response[key].push(value);
      } else {
        this.response[key] = value;
      }
    }
  }

  subscribe(request: SubscriptionReq) {
    this.request = request;
    return this;
  }

  parse(xml: Buffer): Promise<T | any> {
    return new Promise((resolve, reject) => {
      this.parser.on('finish', () => {
        resolve(this.response);
      });

      this.parser.on('error', (err) => {
        reject(err);
      });

      this.parser.parse(xml);
    });
  }
}
