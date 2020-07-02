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
  private _tags: Node[] = [];
  private _currentParentTag: Node;
  private _currentChildTag: Node;
  private _currentProperty: Property;
  private _childIdx: number = -1;

  constructor(private subscriptions: Subscription[]) {
    if (!subscriptions) {
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
        if (this._tags) {
          resolve(this._tags.toObject());
        } else {
          reject(new Error('Unable to parse the XML'));
        }
      });
      this._parser.on('error', reject);
      this._parser.parse(readable);
    });
  }

  private _matchesASubscription(): boolean {
    for (const subscription of this.subscriptions) {
      if (this._currentXPath.matched(subscription.path)) {
        return true;
      }
    }
    return false;
  }

  private _onTagOpen(tag: TagOpenNode) {
    this._currentXPath.push(tag.name);
    // check if path matches root
    if (this._matchesASubscription()) {
      // current node is this
      this._currentParentTag = new Node(tag, null, this._currentXPath);
      this._tags.push(this._currentParentTag);
      this._childIdx = this._childIdx + 1;
    } else if (this._tags && this.subscriptions.properties) {
      for (const prop of this.subscriptions.properties) {
        if (prop.path === tag.name) {
          this._currentProperty = prop;
          this._currentChildTag = new Node(tag, prop, this._currentXPath);
          break;
        }
      }
    }
  }

  private _onTextOrCdata(text: TextNode | CDATANode) {
    if (text && text.contents && this._tags) {
      if (this._currentProperty) {
        this._currentChildTag.setContent(text.contents, this._currentProperty.toObject);
      } else {
        this._tags.setContent(text.contents, this.subscriptions.toObject);
      }
    }
  }

  private _onTagClose(tag: TagCloseNode) {
    this._currentXPath.pop(tag.name);
    if (this._tags && this._currentChildTag) {
      this._tags.addChild(this._currentChildTag, this._childIdx);
    }
  }
}
