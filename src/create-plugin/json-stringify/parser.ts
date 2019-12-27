import {parsers} from 'prettier/parser-babylon';
import {Parser} from 'prettier';

const baseParser = parsers['json-stringify'];

export function createParser(astFormat: string): Parser {
  return {
    ...baseParser,
    astFormat,
  };
}
