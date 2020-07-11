# json-xml-json

This NPM package exposes a `GenericParser` and `SubscriptionParser` using `saxophone-ts` and `fast-json-parse` to convert a XML with JSON data.

The `GenericParser` is used to parse the whole XML document using `saxophone-ts` library into a JSON.

Whereas, `SubscriptionParser` used a json mapping to identify specific element and returns them in a flat structure.

> Please note the `SubscriptionParser` will flatten the XML out based on the mapping provided
> The tag must be unique, otherwise the tag values will be packed as an array with all the values.

## test data

- [test_1.xml](https://github.com/agrawald/json-xml-json/blob/master/data/test_1.xml)
- [test_2.xml](https://github.com/agrawald/json-xml-json/blob/master/data/test_2.xml)

## usage

Please refer to test cases in the repository.

### subscription based parsing

```typescript
const xml = fs.readFileSync('./data/test_2.xml');
const soapParser = new SubscriptionParser<any>();
const subscriptionReq = [
  { tag: 'Envelope.Body.pa.paReq.refId', name: 'refId' },
  { tag: 'Envelope.Body.pa.paReq.ced.id', name: 'ids' },
  { tag: 'Envelope.Header.activity.activityDetails.activityId', name: 'actId' },
  { tag: 'Envelope.Body.dataJson', name: 'json', converter: dataJsonConverter },
];
const response = await soapParser.subscribe(subscriptionReq).parse(xml);
```

### parsing full XML into a JSON object

```typescript
const xml = fs.readFileSync('./data/test_1.xml');
const soapParser = new GenericParser<any>();
const response = await soapParser.parse(xml);
```
