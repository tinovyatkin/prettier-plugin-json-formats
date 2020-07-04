import {JsonFlags} from '../flags';

import {Parser} from 'prettier';
import {Node} from './nodes';
import {parseJson} from './parser';

export * from './nodes';
export * from './values';
export {parseJson, InvalidJsonError} from './parser';

function locStart(node: Node): number {
  return node.start.offset;
}

function locEnd(node: Node): number {
  return node.end.offset;
}

export function createParser(
  astFormat: string,
  flags = JsonFlags.Loose,
): Parser {
  return {
    astFormat,
    locStart,
    locEnd,
    parse: text => parseJson(text, flags),
  };
}
