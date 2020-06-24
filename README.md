# json-xml-json

This NPM package exposes a `GenericSoapParser` using `saxophone-ts` and `fast-json-parse` to convert a XML with JSON data.

> Please note the parser will flatten the XML out based on the mapping provided
> The tag must be unique, otherwise the tag values will be packed as an array with all the values.

## test data

- [test_1.xml](https://github.com/agrawald/json-xml-json/blob/master/data/test_1.xml)
- [test_2.xml](https://github.com/agrawald/json-xml-json/blob/master/data/test_2.xml)

## usage

Please refer to [test cases](https://github.com/agrawald/json-xml-json/blob/master/src/index.test.ts) in the repository.

### subscription based parsing

```typescript
const xml = fs.readFileSync('./data/test_2.xml');
const soapParser = new SubscriptionParser<any>(xml);
const subscriptionReq = [
  { tag: 'soapenv:Envelope.soapenv:Body.pa.paReq.refId', name: 'refId' },
  { tag: 'soapenv:Envelope.soapenv:Body.pa.paReq.ced.id', name: 'ids' },
  { tag: 'soapenv:Envelope.soapenv:Header.activity.activityDetails.activityId', name: 'actId' },
  { tag: 'soapenv:Envelope.soapenv:Body.dataJson', name: 'json', converter: dataJsonConverter },
];
const response = await soapParser.subscribe(subscriptionReq);
```

### parsing full XML

```typescript
const xml = fs.readFileSync('./data/test_1.xml');
const soapParser = new GenericParser<any>(xml);
const response = await soapParser.parse();
```
