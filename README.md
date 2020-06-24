# json-xml-json

This NPM package exposes a `GenericSoapParser` using `saxophone-ts` and `fast-json-parse` to convert a XML with JSON data.

> Please note the parser will flatten the XML out based on the mapping provided
> The tag must be unique, otherwise the tag values will be packed as an array with all the values.

## test data

- [test_1.xml](https://github.com/agrawald/json-xml-json/blob/master/data/test_1.xml)
- [test_2.xml](https://github.com/agrawald/json-xml-json/blob/master/data/test_2.xml)

## usage

Please refer to [test cases](https://github.com/agrawald/json-xml-json/blob/master/src/index.test.ts) in the repository.

```typescript
const xml = fs.readFileSync('./data/test_1.xml');
const soapParser = new GenericSoapParser<any>(xml);
const subscriptionReq = [
  { tag: 'dataJson', name: 'json', converter: dataJsonConverter },
  { tag: 'id', name: 'id' },
];
const pResponse = soapParser.subscribe(subscriptionReq);
soapParser.parse();
const response = await pResponse;
```
