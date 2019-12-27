import {SupportLanguage, Parser, Printer, SupportOption} from 'prettier';

import {createJsonStringifyPlugin} from './json-stringify';
import {AstModifier} from './interfaces';

export type CustomLanguage = Omit<SupportLanguage, 'parsers'>;

export interface JsonPlugin {
  languages: SupportLanguage[];

  options?: Record<string, SupportOption>;

  parsers: Record<string, Parser>;
  printers: Record<string, Printer>;
}

export function createJsonPlugin(language: CustomLanguage, modifier: AstModifier): JsonPlugin {
  const astFormat = language.name;

  return {
    ...createJsonStringifyPlugin(astFormat, modifier),

    languages: [
      {
        ...language,
        parsers: [astFormat],
      },
    ],
  };
}
