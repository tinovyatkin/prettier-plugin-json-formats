/**
 * Mode used for parsing and printing JSON
 */
export enum JsonFlags {
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
