import * as jsonToXml from 'xml-js';
import * as XmlToJson from 'xml-to-json-stream';

// convert json to xml : getXml(json);
export function getXml(json: any) {
  var xml = jsonToXml.json2xml(json, { compact: true, ignoreComment: true });
  return xml;
}

// convert xml to json : await getJson(xml);
export async function getJson<T>(xml: any): Promise<T> {
  return new Promise((resolve, reject) => {
    const parser = XmlToJson({ attributeMode: false });
    parser.xmlToJson(xml, (err, json) => {
      if (err) {
        reject(err);
      }
      resolve(json);
    });
  });
}
