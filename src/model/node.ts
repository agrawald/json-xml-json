import { parseAttrs } from 'saxophone-ts';
import { TagOpenNode } from 'saxophone-ts/dist/types/src/static/nodes';
import { Converter, Property } from './interfaces';
import Path from './path';

export default class Node {
  private _name: string;
  private _namespace?: string;
  private _path?: Path;
  private _content: any;
  private _attributes: object;
  private _children: Node[][];

  constructor(tagOpenNode: TagOpenNode, prop: Property, currentPath: Path) {
    const tokens = tagOpenNode.name.split(':');
    if (tokens.length > 1) {
      this._namespace = tokens[0];
      this._name = tokens[1];
    } else {
      this._name = tokens[0];
    }

    if (prop) {
      this._name = prop.name;
    }
    this._path = currentPath;

    if (tagOpenNode.attrs) {
      this._attributes = parseAttrs(tagOpenNode.attrs);
    }
  }

  pathMatch(path: string) {
    return this._path.matched(path);
  }

  addChild(prop: Node, index: number) {
    if (!this._children) {
      this._children = [];
    }

    if (!this._children[index]) {
      this._children[index] = [];
    }

    this._children[index].push(prop);
  }

  setContent<T>(content: string, converter?: Converter<T>) {
    if (content) {
      const cleanContent = content.replace(/\r?\n?/g, '').trim();
      if (cleanContent.length > 0) {
        if (converter) {
          this._content = converter.convert(cleanContent);
        } else {
          this._content = cleanContent;
        }
      }
    }
  }

  toObject(): { [name: string]: any } {
    const response = {};
    response['_content'] = this._content;
    response['_attributes'] = this._attributes;
    response['_children'] = this._prepareChildren();
    return response;
  }

  private _prepareChildren(): { [name: string]: any }[] {
    if (this._children) {
      const children = [];
      for (const child of this._children) {
        const childObject = this._prepareChild(child);
        children.push(childObject);
      }
      return children;
    }
    return undefined;
  }

  private _prepareChild(child: Node[]): { [name: string]: any } {
    const childObject = {};
    for (const prop of child) {
      childObject[prop._name] = prop._content;
    }
    return childObject;
  }
}
