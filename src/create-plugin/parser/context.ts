import {JsonFlags} from '../flags';

import {Position} from './nodes';

/**
 * Context passed around the parser with information about where we currently are in the parse.
 */
export interface ParserContext {
  position: Position;
  previousPosition: Position;

  readonly text: string;
  readonly flags: JsonFlags;
}

function createFlagSwitch(flag: JsonFlags): (context: ParserContext) => boolean {
  return context => (context.flags & flag) != 0;
}

export const supportComments = createFlagSwitch(JsonFlags.CommentsAllowed);
export const supportHexadecimalNumbers = createFlagSwitch(JsonFlags.HexadecimalNumberAllowed);
export const supportIdentifiers = createFlagSwitch(JsonFlags.IdentifierKeyNamesAllowed);
export const supportLaxNumbers = createFlagSwitch(JsonFlags.LaxNumberParsingAllowed);
export const supportMultilineStrings = createFlagSwitch(JsonFlags.MultiLineStringAllowed);
export const supportNumberConstants = createFlagSwitch(JsonFlags.NumberConstantsAllowed);
export const supportSingleQuotes = createFlagSwitch(JsonFlags.SingleQuotesAllowed);
export const supportTrailingCommas = createFlagSwitch(JsonFlags.TrailingCommasAllowed);
