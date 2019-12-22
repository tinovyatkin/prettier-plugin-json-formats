import {Parser} from 'prettier';
import {parsers} from 'prettier/parser-babylon';
import {JsonPlugin, AstModifier, CustomLanguage} from './interfaces';
import {createPrinter} from './printer';

const baseParser = parsers['json-stringify'];

function createParser(astFormat: string): Parser {
  return {
    ...baseParser,
    astFormat,
  };
}

export function createJsonPlugin(language: CustomLanguage, modifier: AstModifier): JsonPlugin {
  const astFormat = language.name;

  return {
    languages: [
      {
        ...language,
        parsers: [astFormat],
      },
    ],

    parsers: {
      [astFormat]: createParser(astFormat),
    },

    printers: {
      [astFormat]: createPrinter(modifier),
    },
  };
}
