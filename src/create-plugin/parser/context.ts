import {Position} from './nodes';

/**
 * Context passed around the parser with information about where we currently are in the parse.
 */
export interface ParserContext {
  position: Position;
  previousPosition: Position;

  readonly text: string;
  readonly flags: ParserFlags;
}

/**
 * The Parse mode used for parsing the JSON string.
 */
export enum ParserFlags {
  Strict = 0, // Standard JSON.
  CommentsAllowed = 1 << 0, // Allows comments, both single or multi lines.
  SingleQuotesAllowed = 1 << 1, // Allow single quoted strings.
  IdentifierKeyNamesAllowed = 1 << 2, // Allow identifiers as objectp properties.
  TrailingCommasAllowed = 1 << 3,
  HexadecimalNumberAllowed = 1 << 4,
  MultiLineStringAllowed = 1 << 5,
  LaxNumberParsingAllowed = 1 << 6, // Allow `.` or `+` as the first character of a number.
  NumberConstantsAllowed = 1 << 7, // Allow -Infinity, Infinity and NaN.

  Default = Strict,
  Loose = CommentsAllowed |
    SingleQuotesAllowed |
    IdentifierKeyNamesAllowed |
    TrailingCommasAllowed |
    HexadecimalNumberAllowed |
    MultiLineStringAllowed |
    LaxNumberParsingAllowed |
    NumberConstantsAllowed,

  Json = Strict,
  Json5 = Loose,
  JsonWithComments = CommentsAllowed,
}

function createFlagSwitch(flag: ParserFlags): (context: ParserContext) => boolean {
  return context => (context.flags & flag) != 0;
}

export const supportComments = createFlagSwitch(ParserFlags.CommentsAllowed);
export const supportHexadecimalNumbers = createFlagSwitch(ParserFlags.HexadecimalNumberAllowed);
export const supportIdentifiers = createFlagSwitch(ParserFlags.IdentifierKeyNamesAllowed);
export const supportLaxNumbers = createFlagSwitch(ParserFlags.LaxNumberParsingAllowed);
export const supportMultilineStrings = createFlagSwitch(ParserFlags.MultiLineStringAllowed);
export const supportNumberConstants = createFlagSwitch(ParserFlags.NumberConstantsAllowed);
export const supportSingleQuotes = createFlagSwitch(ParserFlags.SingleQuotesAllowed);
export const supportTrailingCommas = createFlagSwitch(ParserFlags.TrailingCommasAllowed);
