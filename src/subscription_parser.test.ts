import * as fs from 'fs';
import { GenericParser } from './generic_parser';
import { Converter } from './interfaces';
import { SubscriptionParser } from './subscription_parser';
const parse = require('fast-json-parse');
test('Parse a SOAP XML with embedded JSON', async () => {
  const xml = fs.readFileSync('./data/test_2.xml');
  const soapParser = new SubscriptionParser<any>();
  const subscriptionReq = [
    { tag: 'Envelope.Body.pa.paReq.refId', name: 'refId' },
    { tag: 'Envelope.Body.pa.paReq.ced.id', name: 'ids' },
    { tag: 'Envelope.Header.activity.activityDetails.activityId', name: 'actId' },
    { tag: 'Envelope.Body.dataJson', name: 'json', converter: dataJsonConverter },
  ];
  const response = await soapParser.subscribe(subscriptionReq).parse(xml);
  expect(response).toBeDefined();
  expect(response.refId).toBe('cliRefId');
  expect(response.ids).toBeDefined();
  expect(response.ids.length).toBe(2);
  expect(response.ids[0]).toBe('crn-1');
  expect(response.ids[1]).toBe('crn-2');
  expect(response.actId).toBe('actID');
  expect(response.json).toBeDefined();
  expect(response.json.x).toBe('a');
});

const dataJsonConverter = new (class DataJsonConverter implements Converter<any> {
  convert(value: string): any {
    const result = parse(value);
    if (result.err) {
      throw result.err;
    }
    return result.value;
  }
})();
