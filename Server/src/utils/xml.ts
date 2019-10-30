import { xml2json, json2xml } from 'xml-js';

export type XmlArray<T> = undefined | T | readonly T[];

export function xmlArray<T>(xml: XmlArray<T>): readonly T[] {
  if (!xml) return [];
  if (Array.isArray(xml)) return xml;
  return [xml as any];
}

export type Xml = string;
export function xmlStringify(xml: any, root: string): Xml {
  return json2xml(JSON.stringify({ [root]: xml }), { compact: true });
}
export function xmlParse(value: Xml, root: string): any {
  return JSON.parse(xml2json(value, { compact: true }))[root];
}

const xmlEscapeMap = {
  '>': '&gt;',
  '<': '&lt;',
  "'": '&apos;',
  '"': '&quot;',
  '&': '&amp;'
};
const xmlEscapePattern = /[&"<>']/g;
export function xmlEscape(value: string): string {
  if (!value) return value;
  return value.replace(xmlEscapePattern, (str, item) => xmlEscapeMap[item]);
}

const xmlTrue = 'true';
const xmlFalse = 'false';
export type XmlBoolean = typeof xmlTrue | typeof xmlFalse;
export function booleanToXml(value: boolean): XmlBoolean {
  return value ? xmlTrue : xmlFalse;
}
export function xmlToBoolean(value: XmlBoolean): boolean {
  return value === xmlTrue;
}
