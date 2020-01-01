import {SupportLanguage, Parser, Printer, SupportOption} from 'prettier';

import {createPrinter as createJsonStringifyPrinter} from './printers/json-stringify';
import {AstModifier} from './interfaces';
import {ParserFlags, createParser} from './parser';

type PrinterFactory = (modifier: AstModifier, flags: ParserFlags) => Printer;

const createPrinter = new Map<string, PrinterFactory>();
createPrinter.set('json-stringify', createJsonStringifyPrinter);

export type CustomLanguage = Omit<SupportLanguage, 'parsers'>;

export interface JsonPlugin {
  languages: SupportLanguage[];

  options?: Record<string, SupportOption>;

  parsers: Record<string, Parser>;
  printers: Record<string, Printer>;
}

export interface JsonPluginInput {
  language: CustomLanguage;

  modifier: AstModifier;

  flags?: ParserFlags;

  printer?: 'json-stringify';
}

export function createJsonPlugin({
  language,
  modifier,
  flags = ParserFlags.Loose,
  printer = 'json-stringify',
}: JsonPluginInput): JsonPlugin {
  const astFormat = language.name;

  if (!createPrinter.has(printer)) {
    throw new Error(`Unknown JSON printer: ${printer}`);
  }

  return {
    parsers: {
      [astFormat]: createParser(astFormat, flags),
    },
    printers: {
      [astFormat]: createPrinter.get(printer)!(modifier, flags),
    },

    languages: [
      {
        ...language,
        parsers: [astFormat],
      },
    ],
  };
}
