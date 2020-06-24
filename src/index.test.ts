import * as fs from 'fs';
import { Converter, GenericSoapParser } from '.';

const parse = require('fast-json-parse');

const dataJsonConverter = new (class DataJsonConverter implements Converter<any> {
  convert(value: string): any {
    const result = parse(value);
    if (result.err) {
      throw result.err;
    }
    return result.value;
  }
})();

test('Parse a SOAP XML with embedded JSON', async () => {
  const xml = fs.readFileSync('./data/test_1.xml');
  const soapParser = new GenericSoapParser<any>(xml);
  const subscriptionReq = [
    { tag: 'dataJson', name: 'json', converter: dataJsonConverter },
    { tag: 'id', name: 'id' },
  ];
  const pResponse = soapParser.subscribe(subscriptionReq);
  soapParser.parse();
  const response = await pResponse;
  expect(response).toBeDefined();
  expect(response.id).toBe('123');
  expect(response.json).toBeDefined();
  expect(response.json.a).toBe('x');
  expect(response.json.b).toBe('y');
  expect(response.json.c).toBe('z');
});

test('Parse a SOAP XML with nested elements', async () => {
  const xml = fs.readFileSync('./data/test_2.xml');
  const soapParser = new GenericSoapParser<any>(xml);
  const subscriptionReq = [
    { tag: 'activityId', name: 'activityId' },
    { tag: 'refId', name: 'refId' },
    { tag: 'id', name: 'ids' },
  ];
  const pResponse = soapParser.subscribe(subscriptionReq);
  soapParser.parse();
  const response = await pResponse;
  expect(response).toBeDefined();
  expect(response.refId).toBe('cliRefId');
  expect(response.ids).toBeDefined();
  expect(response.ids.length).toBe(2);
  expect(response.ids[0]).toBe('crn-1');
  expect(response.ids[1]).toBe('crn-2');
  expect(response.activityId).toBe('actID');
});
