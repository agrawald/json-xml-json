import { parseAttrs, Saxophone } from 'saxophone-ts';
import { TagOpenNode, TagCloseNode, TextNode } from 'saxophone-ts/dist/types/src/static/nodes';

class Tag {
  name: string;
  attrs?: any;
  previous?: Tag;
  next?: Tag[];
  text?: string;

  constructor(tag?: { name: string; isSelfClosing: boolean; attrs: any }) {
    if (tag) {
      this.update(tag);
    }
  }

  update(tag: { name: string; isSelfClosing: boolean; attrs: any }) {
    this.name = tag.name.split(':').reverse()[0];
    if (tag.attrs) this.attrs = parseAttrs(tag.attrs);
  }

  toObject() {
    const resp = {};
    if (this.text) {
      resp[this.name] = this.text;
    }

    if (this.attrs) {
      resp['attrs'] = this.attrs;
    }

    if (this.next) {
      if (this.next.length > 0) {
        resp[this.name] = [];
        for (let i = 0; i < this.next.length; i++) {
          resp[this.name][i] = this.next[i].toObject();
        }
      } else if (this.next[0].name && this.next[0].name.length > 0) {
        resp[this.name] = this.next[0].toObject();
      }
    }
    return resp;
  }
}

export class GenericParser<T> {
  protected parser: Saxophone;
  private currentTag: Tag;

  constructor() {
    this.parser = new Saxophone();
    this.parser.on('tagOpen', this.onTagOpen.bind(this));
    this.parser.on('tagClose', this.onTagClose.bind(this));
    this.parser.on('text', this.onTextOrCdata.bind(this));
    this.parser.on('cdata', this.onTextOrCdata.bind(this));
  }

  private onTagOpen(tag: TagOpenNode): void {
    const newTag = new Tag(tag);
    if (this.currentTag) {
      if (!this.currentTag.next) {
        this.currentTag.next = [];
      }
      this.currentTag.next.push(newTag);
      newTag.previous = this.currentTag;
    }
    this.currentTag = newTag;
  }

  private onTagClose(tag: TagCloseNode): void {
    if (this.currentTag.previous) {
      this.currentTag = this.currentTag.previous;
    }
  }

  private onTextOrCdata(text: TextNode): void {
    const trimmed = text.contents.trim();
    if (trimmed.length > 0 && trimmed.indexOf('\n') === -1) {
      this.currentTag.text = text.contents.trim();
    }
  }

  parse(xml: Buffer): Promise<T | any> {
    return new Promise((resolve, reject) => {
      this.parser.on('finish', () => {
        resolve(this.currentTag.toObject());
      });

      this.parser.on('error', (err) => {
        reject(err);
      });

      this.parser.parse(xml);
    });
  }
}
