import {SupportLanguage, Parser, Printer, SupportOption} from 'prettier';

import {createPrinter as createJsonStringifyPrinter} from './printers/json-stringify';
import {createPrinter as createJsonPrinter} from './printers/json';
import {JsonFlags} from './flags';
import {AstModifier} from './interfaces';
import {createParser} from './parser';

type PrinterFactory = (modifier: AstModifier, flags: JsonFlags) => Printer;

const createPrinter = new Map<string, PrinterFactory>();
createPrinter.set('json-stringify', createJsonStringifyPrinter);
createPrinter.set('json', createJsonPrinter);

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

  flags?: JsonFlags;

  parserFlags?: JsonFlags;

  printer?: 'json-stringify' | 'json';
}

export function createJsonPlugin({
  language,
  modifier,
  flags = JsonFlags.Loose,
  parserFlags = JsonFlags.Loose,
  printer = 'json-stringify',
}: JsonPluginInput): JsonPlugin {
  const astFormat = language.name;

  if (!createPrinter.has(printer)) {
    throw new Error(`Unknown JSON printer: ${printer}`);
  }

  return {
    parsers: {
      [astFormat]: createParser(astFormat, parserFlags),
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
