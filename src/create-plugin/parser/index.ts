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

export const parser: Parser = {
  astFormat: 'json',
  locStart,
  locEnd,
  parse: text => parseJson(text, ParserFlags.Loose),
};
