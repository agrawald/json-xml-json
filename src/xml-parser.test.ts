import * as fs from 'fs';
import XmlParser from './xml-parser';
import JsonConverter from './converter/json-converter';
test('Parse a SOAP XML with embedded JSON', async () => {
  const xml = fs.readFileSync('./data/test_1.xml');
  const xmlParser = new XmlParser([
    {
      name: 'ab',
      path: '/Envelope/Body/ab',
      properties: [
        {
          name: 'key',
          path: 'id',
        },
        {
          name: 'json',
          path: 'dataJson',
          toObject: new JsonConverter(),
        },
      ],
    },
    {
      name: 'header',
      path: '/Envelope/Header',
      properties: [
        {
          name: 'activityId',
          path: 'actId',
        },
      ],
    },
  ]);
  const response = await xmlParser.parse(xml);
  console.log(JSON.stringify(response));
});
