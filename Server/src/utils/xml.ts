import { xml2json, json2xml } from 'xml-js';

export type XmlArray<T> = undefined | T | readonly T[];

export function xmlStringify(xml: any, root: string): string {
  return json2xml(JSON.stringify({ [root]: xml }), { compact: true });
}

export function xmlParse(value: string, root: string): any {
  return JSON.parse(xml2json(value, { compact: true }))[root];
}
