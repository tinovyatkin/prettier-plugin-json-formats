import {Parser} from 'prettier';
import {Node} from './nodes';
import {parseJson} from './parser';
import {ParserFlags} from './context';

export * from './nodes';
export * from './values';
export {parseJson, InvalidJsonError} from './parser';
export {ParserFlags} from './context';

function locStart(node: Node): number {
  return node.start.offset;
}

function locEnd(node: Node): number {
  return node.end.offset;
}

export function createParser(astFormat: string, flags = ParserFlags.Loose): Parser {
  return {
    astFormat,
    locStart,
    locEnd,
    parse: text => parseJson(text, flags),
  };
}
