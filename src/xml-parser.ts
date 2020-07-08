import { Saxophone } from 'saxophone-ts';
import {
  CDATANode,
  CommentNode,
  ProcessingInstructionNode,
  TagCloseNode,
  TagOpenNode,
  TextNode,
} from 'saxophone-ts/dist/types/src/static/nodes';
import Node from './model/node';
import Path from './model/path';
import Subscription, { Property } from './model/interfaces';

export default class XmlParser {
  private _parser: Saxophone;
  private readonly _currentXPath = new Path();
  private _rootTag: Node;
  private _currentTag: Node;
  private _currentProperty: Property;
  private _childIdx: number = -1;

  constructor(private rootSubscription: Subscription) {
    if (!rootSubscription) {
      throw new Error('Please provide details on what you want to subscribe on!');
    }

    this._parser = new Saxophone();
    this._parser.on('tagOpen', this._onTagOpen.bind(this));
    this._parser.on('tagClose', this._onTagClose.bind(this));
    this._parser.on('text', this._onTextOrCdata.bind(this));
    this._parser.on('cdata', this._onTextOrCdata.bind(this));
  }

  parse(readable: Buffer): Promise<object> {
    return new Promise((resolve, reject) => {
      this._parser.on('finish', () => {
        if (this._rootTag) {
          resolve(this._rootTag.toObject());
        } else {
          reject(new Error('Unable to parse the XML'));
        }
      });
      this._parser.on('error', reject);
      this._parser.parse(readable);
    });
  }

  private _onTagOpen(tag: TagOpenNode) {
    this._currentXPath.push(tag.name);
    // check if path matches root
    if (this._currentXPath.matched(this.rootSubscription.path)) {
      // current node is this
      if (!this._rootTag) {
        this._rootTag = new Node(tag, null, this._currentXPath);
      }
      this._childIdx = this._childIdx + 1;
    } else if (this._rootTag && this.rootSubscription.properties) {
      const property = this._findProperty(this.rootSubscription.properties, tag.name);
      if (property) {
        this._currentProperty = property;
        this._currentTag = new Node(tag, property, this._currentXPath);
      }
    }
  }

  private _findProperty(properties: Property[], tagName: string): Property {
    for (const prop of properties) {
      if (prop.path === tagName) {
        return prop;
      } else if (prop.properties) {
        const childProp = this._findProperty(prop.properties, tagName);
        if (childProp) {
          return childProp;
        }
      }
    }

    return null;
  }

  private _onTextOrCdata(text: TextNode | CDATANode) {
    if (text && text.contents && this._rootTag) {
      if (this._currentProperty) {
        this._currentTag.setContent(text.contents, this._currentProperty.toObject);
      } else {
        this._rootTag.setContent(text.contents, this.rootSubscription.toObject);
      }
    }
  }

  private _onTagClose(tag: TagCloseNode) {
    this._currentXPath.pop(tag.name);
    if (this._rootTag && this._currentTag) {
      this._rootTag.addChild(this._currentTag, this._childIdx);
    }
  }
}
