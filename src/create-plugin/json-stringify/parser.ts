import {Parser} from 'prettier';

import {parser as baseParser} from '../parser';

export function createParser(astFormat: string): Parser {
  return {
    ...baseParser,
    astFormat,
  };
}
