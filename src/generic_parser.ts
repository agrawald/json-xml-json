import { parseAttrs, Saxophone } from 'saxophone-ts';

class Tag {
  name: string;
  attrs: any;
  previous?: Tag;
  next?: Tag[];
  text?: string;

  constructor(tag?: { name: string; isSelfClosing: boolean; attrs: any }) {
    if (tag) {
      this.update(tag);
    }
  }

  update(tag: { name: string; isSelfClosing: boolean; attrs: any }) {
    this.name = tag.name;
    if (tag.attrs) this.attrs = parseAttrs(tag.attrs);
  }
}

export class GenericParser<T> {
  protected parser: Saxophone;

  constructor(protected xml: Buffer) {
    this.parser = new Saxophone();
  }

  parse(): Promise<T | any> {
    return new Promise((resolve, reject) => {
      let currentTag: Tag;
      this.parser.on('tagOpen', (pTag) => {
        const newTag = new Tag(pTag);
        if (currentTag) {
          if (!currentTag.next) {
            currentTag.next = [];
          }
          currentTag.next.push(newTag);
          newTag.previous = currentTag;
        }
        currentTag = newTag;
      });

      this.parser.on('text', (pText) => {
        if (pText.contents.trim().indexOf('\n') === -1) {
          currentTag.text = pText.contents.trim();
        }
      });

      this.parser.on('tagClose', (pTag) => {
        if (currentTag.previous) {
          currentTag = currentTag.previous;
        }
      });

      this.parser.on('finish', () => {
        resolve(currentTag);
      });

      this.parser.on('error', (err) => {
        reject(err);
      });

      this.parser.parse(this.xml);
    });
  }
}
