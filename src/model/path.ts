export default class Path {
  private readonly _path = [];

  constructor(tagName?: string) {
    this.push(tagName);
  }

  pop(tagName: string) {
    if (tagName) {
      this._path.pop();
    }
  }
  push(tagName: string) {
    if (tagName) {
      const tokens = tagName.split(':');
      if (tokens && tokens.length > 1) {
        this._path.push(tokens[1]);
      } else {
        this._path.push(tokens[0]);
      }
    }
  }

  fullPath() {
    return this._path.reduce((accumlator, p) => `${accumlator}/${p}`, '');
  }

  matched(path: string) {
    const fullPath = this.fullPath();
    return fullPath === path;
  }
}
