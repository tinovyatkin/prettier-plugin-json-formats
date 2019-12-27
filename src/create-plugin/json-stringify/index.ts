import {AstModifier} from '../interfaces';
import {JsonTypePlugin} from '../json-type';

import {createParser} from './parser';
import {createPrinter} from './printer';

export function createJsonStringifyPlugin(name: string, modifier: AstModifier): JsonTypePlugin {
  return {
    parsers: {
      [name]: createParser(name),
    },
    printers: {
      [name]: createPrinter(modifier),
    },
  };
}
