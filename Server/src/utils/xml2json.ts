import * as jsonToXml from 'xml-js';
import * as XmlToJson from 'xml-to-json-stream';

const parser = XmlToJson({ attributeMode: false });

// convert json to xml : getXml(json);
export function getXml(json: any) {
  var xml = jsonToXml.json2xml(json, { compact: true, ignoreComment: true });
  return xml;
}

// convert xml to json : await getJson(xml);
export function getJson<T>(xml: any): Promise<T> {
  return new Promise((resolve, reject) => parser.xmlToJson(xml, (err, json) => (err ? reject(err) : resolve(json))));
}

//---------------------------------------------------
