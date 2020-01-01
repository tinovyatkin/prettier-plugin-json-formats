import {JsonFlags} from '../flags';

import {
  ParserContext,
  supportLaxNumbers,
  supportNumberConstants,
  supportHexadecimalNumbers,
  supportSingleQuotes,
  supportMultilineStrings,
  supportTrailingCommas,
  supportIdentifiers,
} from './context';
import {
  NullLiteral,
  StringLiteral,
  NumberLiteral,
  Expression,
  Comment,
  Position,
  TrueLiteral,
  FalseLiteral,
  BaseValueNode,
  SingleLineComment,
  MultiLineComment,
  ArrayExpression,
  ObjectExpression,
  ObjectProperty,
  Identifier,
} from './nodes';
import {JsonArray, JsonObject} from './values';

const DIGITS = '0123456789';
const HEX = `${DIGITS}abcdefABCDEF`;
const ALPHANUMERIC = `${DIGITS}abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`;
const IDENTIFIER_CHARACTER = `${ALPHANUMERIC}_$`;

export class InvalidJsonError extends Error {
  public constructor(message: string, context: ParserContext) {
    super(`${message} at ${context.position.line}:${context.position.column}`);
  }
}

function isEOF(context: ParserContext) {
  return context.position.offset >= context.text.length;
}

function peek(context: ParserContext, offset = 0): string | undefined {
  return context.text[context.position.offset + offset];
}

function pop(context: ParserContext): string | undefined {
  const character = peek(context);
  next(context);
  return character;
}

function next(context: ParserContext) {
  let {offset, line, column} = context.position;

  offset++;
  if (peek(context) == '\n') {
    line++;
    column = 0;
  } else {
    column++;
  }

  context.previousPosition = context.position;
  context.position = {offset, line, column};
}

function consume(context: ParserContext, ...allowedCharactersArr: [string, ...string[]]) {
  const consumedCharacters: string[] = [];

  for (const allowedCharacters of allowedCharactersArr) {
    const character = peek(context);

    if (character == undefined) {
      throw new InvalidJsonError('Unexpected end of file', context);
    } else if (!allowedCharacters.includes(character)) {
      throw new InvalidJsonError('Invalid character', context);
    }

    next(context);
    consumedCharacters.push(character);
  }

  return consumedCharacters.join('');
}

function assert(context: ParserContext, supports: (context: ParserContext) => boolean) {
  if (!supports(context)) {
    throw new InvalidJsonError('Invalid character', context);
  }
}

function appendTrailingComments(node: BaseValueNode, comments: Comment[] | undefined) {
  if (comments != null) {
    node.trailingComments = [...(node.trailingComments || []), ...comments];
  }
}

export function parseJson(text: string, flags: JsonFlags): Expression {
  const context = {
    position: {column: 0, line: 0, offset: 0},
    previousPosition: {column: 0, line: 0, offset: 0},

    flags,
    text,
  };

  const node = parseExpression(context);

  node.trailingComments = parseComments(context);

  if (!isEOF(context)) {
    const rest = text.slice(context.position.offset);
    const prettyRest = rest.length > 20 ? `${rest.substr(0, 20)}...` : rest;
    throw new InvalidJsonError(`Expected end of file, got "${prettyRest}"`, context);
  }

  return node;
}

function parseExpression(context: ParserContext, leadingComments?: Comment[]): Expression {
  if (peek(context) == null) {
    throw new InvalidJsonError('Unexpected end of file', context);
  }

  if (leadingComments == null) {
    leadingComments = parseComments(context);
  }

  const expression =
    tryParseNumberLiteral(context, leadingComments) ||
    tryParseStringLiteral(context, leadingComments) ||
    tryParseKeywordLiteral(context, leadingComments) ||
    tryParseArrayExpression(context, leadingComments) ||
    tryParseObjectExpression(context, leadingComments);

  if (expression == null) {
    throw new InvalidJsonError('Invalid character', context);
  }

  return expression;
}

function tryParseNumberLiteral(
  context: ParserContext,
  leadingComments?: Comment[],
): NumberLiteral | null {
  const start = context.position;
  let sign = 1;

  switch (peek(context)) {
    case '-':
      sign = -1;
      next(context);
      break;
    case '+':
      assert(context, supportLaxNumbers);
      next(context);
  }

  switch (peek(context)) {
    case 'N':
      assert(context, supportNumberConstants);
      consume(context, 'N', 'a', 'N');
      return createNumberLiteral(context, start, NaN, leadingComments);
    case 'I':
      assert(context, supportNumberConstants);
      consume(context, 'I', 'n', 'f', 'i', 'n', 'i', 't', 'y');
      return createNumberLiteral(context, start, sign * Infinity, leadingComments);
    case '0':
      if (peek(context) === 'x') {
        assert(context, supportHexadecimalNumbers);
        next(context);
        next(context);
        return parseHexadecimalNumberLiteral(context, sign, start, leadingComments);
      }

      return parseRegularNumberLiteral(context, sign, start, leadingComments);
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
    case '.':
      return parseRegularNumberLiteral(context, sign, start, leadingComments);
    default:
      if (start.offset !== context.position.offset) {
        throw new InvalidJsonError('Invalid character', context);
      }

      return null;
  }
}

function parseRegularNumberLiteral(
  context: ParserContext,
  sign: number,
  start: Position,
  leadingComments?: Comment[],
): NumberLiteral {
  let hasDot = false;

  const base = [pop(context)!];
  const exponent = ['0'];

  let characters = base;

  if (characters[0] === '.') {
    assert(context, supportLaxNumbers);

    hasDot = true;
    characters.unshift('0');
  }

  while (true) {
    const character = peek(context);

    switch (character) {
      case '.':
        if (hasDot || characters === exponent) {
          throw new InvalidJsonError('Invalid character', context);
        }

        hasDot = true;
        characters.push(character);
        next(context);
        break;
      case '0':
        if (characters.length === 1 && characters[0] === '0') {
          throw new InvalidJsonError('Invalid character', context);
        }

        characters.push(character);
        next(context);
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        characters.push(character);
        next(context);
        break;
      case 'e':
      case 'E':
        if (characters === exponent) {
          throw new InvalidJsonError('Invalid character', context);
        }

        characters = exponent;
        next(context);
        break;
      default: {
        const _base = hasDot
          ? Number.parseFloat(base.join(''))
          : Number.parseInt(base.join(''), 10);
        const _exponent = Number.parseInt(exponent.join(''));

        return createNumberLiteral(
          context,
          start,
          sign * (_base * 10 ** _exponent),
          leadingComments,
        );
      }
    }
  }
}

function parseHexadecimalNumberLiteral(
  context: ParserContext,
  sign: number,
  start: Position,
  leadingComments?: Comment[],
): NumberLiteral {
  // Read an hexadecimal number, until it's not hexadecimal.
  const characters = [];
  const valid = HEX;

  for (let ch = peek(context); ch && valid.includes(ch); ch = peek(context)) {
    // Add it to the hexa string.
    characters.push(ch);
    // Move the position of the context to the next character.
    next(context);
  }

  const value = Number.parseInt(characters.join(''), 16);

  return createNumberLiteral(context, start, sign * value, leadingComments);
}

function createNumberLiteral(
  context: ParserContext,
  start: Position,
  value: number,
  leadingComments?: Comment[],
): NumberLiteral {
  return {
    type: 'number',
    start,
    end: context.position,
    rawText: context.text.slice(start.offset, context.position.offset),
    value,
    leadingComments,
  };
}

function tryParseStringLiteral(
  context: ParserContext,
  leadingComments?: Comment[],
): StringLiteral | null {
  const start = context.position;
  const delimiter = peek(context);

  switch (delimiter) {
    case '"':
      break;
    case "'":
      assert(context, supportSingleQuotes);
      break;
    default:
      return null;
  }

  next(context);
  const characters: string[] = [];

  while (true) {
    let char = pop(context);

    if (char == delimiter) {
      return {
        type: 'string',
        start,
        end: context.position,
        rawText: context.text.slice(start.offset, context.position.offset),
        value: characters.join(''),
        leadingComments,
      };
    } else if (char == '\\') {
      char = pop(context);
      switch (char) {
        case '\\':
        case '/':
        case '"':
        case delimiter:
          characters.push(char);
          break;

        case 'b':
          characters.push('\b');
          break;
        case 'f':
          characters.push('\f');
          break;
        case 'n':
          characters.push('\n');
          break;
        case 'r':
          characters.push('\r');
          break;
        case 't':
          characters.push('\t');
          break;
        case 'u':
          characters.push(String.fromCharCode(parseInt(consume(context, HEX, HEX, HEX, HEX), 16)));
          break;

        case undefined:
          throw new InvalidJsonError('Unexpected end of file', context);

        case '\n':
          // Only valid when multiline strings are allowed.
          assert(context, supportMultilineStrings);
          characters.push(char);
          break;

        default:
          throw new InvalidJsonError('Invalid character', context);
      }
    } else if (char === undefined) {
      throw new InvalidJsonError('Unexpected end of file', context);
    } else if (char == '\b' || char == '\f' || char == '\n' || char == '\r' || char == '\t') {
      throw new InvalidJsonError('Invalid character', context);
    } else {
      characters.push(char);
    }
  }
}

function tryParseKeywordLiteral(
  context: ParserContext,
  leadingComments: Comment[] | undefined,
): TrueLiteral | FalseLiteral | NullLiteral | null {
  const start = context.position;
  switch (peek(context)) {
    case 't':
      consume(context, 't', 'r', 'u', 'e');
      return createKeywordLiteral('true', true);

    case 'f':
      consume(context, 'f', 'a', 'l', 's', 'e');
      return createKeywordLiteral('false', false);

    case 'n':
      consume(context, 'n', 'u', 'l', 'l');
      return createKeywordLiteral('null', null);

    default:
      return null;
  }

  function createKeywordLiteral<T extends TrueLiteral | FalseLiteral | NullLiteral>(
    type: T['type'],
    value: T['value'],
  ): T {
    return {
      type,
      start,
      rawText: type,
      end: context.position,
      value,
      leadingComments,
    } as T;
  }
}

function skipBlanks(context: ParserContext) {
  let char = peek(context);

  while (char == ' ' || char == '\t' || char == '\n' || char == '\r' || char == '\f') {
    next(context);
    char = peek(context);
  }
}

function parseSingleLineComment(context: ParserContext): SingleLineComment {
  consume(context, '/', '/');

  const start = context.position;

  while (context.position.column > 0 && context.position.offset < context.text.length) {
    next(context);
  }

  const comment = context.text.slice(start.offset, context.position.offset);

  return {
    type: 'single line comment',
    start,
    end: context.position,
    comment,
    rawText: `//${context}`,
  };
}

function parseMultiLineComment(context: ParserContext): MultiLineComment {
  consume(context, '/', '*');

  const start = context.position;

  while (peek(context) !== '*' && peek(context, 1) !== '/') {
    next(context);
  }

  if (peek(context) == null) {
    throw new InvalidJsonError('Unexpected end of file', context);
  }

  const comment = context.text.slice(start.offset, context.position.offset);
  consume(context, '*', '/');

  return {
    type: 'multi-line comment',
    start,
    end: context.position,
    comment,
    rawText: `/*${context}*/`,
  };
}

function parseCommentsUntilBlankLine(
  context: ParserContext,
  comments?: Comment[],
): Comment[] | undefined {
  const start = context.position;
  skipBlanks(context);

  if (peek(context) !== '/' || context.position.line > start.line + 1) {
    return comments;
  }

  switch (peek(context, 1)) {
    case '/':
      comments = [...(comments || []), parseSingleLineComment(context)];

      // we consumed the newline, reset the position unless we're at end of file
      if (isEOF(context)) {
        return comments;
      } else {
        context.previousPosition = context.position;
        return parseCommentsUntilBlankLine(context, comments);
      }
    case '*':
      comments = [...(comments || []), parseMultiLineComment(context)];

      return parseCommentsUntilBlankLine(context, comments);

    default:
      throw new InvalidJsonError('Invalid character', context);
  }
}

function parseComments(context: ParserContext, comments?: Comment[]): Comment[] | undefined {
  skipBlanks(context);

  if (peek(context) !== '/') {
    return comments;
  }

  switch (peek(context, 1)) {
    case '/':
      comments = [...(comments || []), parseSingleLineComment(context)];

      return parseComments(context, comments);
    case '*':
      comments = [...(comments || []), parseMultiLineComment(context)];

      return parseComments(context, comments);

    default:
      throw new InvalidJsonError('Invalid character', context);
  }
}

function tryParseArrayExpression(
  context: ParserContext,
  leadingComments?: Comment[],
): ArrayExpression | null {
  if (peek(context) !== '[') {
    return null;
  }

  const start = context.position;
  pop(context);

  const leadingInnerComments = parseCommentsUntilBlankLine(context);
  let leadingElementComments = parseComments(context);

  if (peek(context) === ']') {
    pop(context);
    // empty array
    return {
      type: 'array',
      elements: [],
      start,
      end: context.position,
      rawText: context.text.slice(start.offset, context.position.offset),
      value: [],
      leadingComments,
      leadingInnerComments:
        leadingInnerComments || leadingElementComments
          ? [...(leadingInnerComments || []), ...(leadingElementComments || [])]
          : undefined,
    };
  }

  const elements: Expression[] = [];
  let lastElement: Expression | undefined = undefined;
  const value: JsonArray = [];

  while (true) {
    if (lastElement != null) {
      consume(context, ',');

      const commentsUntilBlank = parseCommentsUntilBlankLine(context);
      const otherComments = parseComments(context);

      if (otherComments && commentsUntilBlank) {
        leadingElementComments = otherComments;
        appendTrailingComments(lastElement, commentsUntilBlank);
      } else {
        leadingElementComments = commentsUntilBlank || otherComments;
      }

      if (peek(context) === ']') {
        assert(context, supportTrailingCommas);
        break;
      }
    }

    lastElement = parseExpression(context, leadingElementComments);
    leadingElementComments = undefined;
    appendTrailingComments(lastElement, parseComments(context));

    elements.push(lastElement);
    value.push(lastElement.value);

    if (peek(context) === ']') {
      break;
    }
  }

  next(context);

  return {
    type: 'array',
    start,
    end: context.position,
    rawText: context.text.slice(start.offset, context.position.offset),
    elements,
    value,
    leadingComments,
    leadingInnerComments,
    trailingInnerComments: leadingElementComments,
  };
}

function tryParseObjectExpression(
  context: ParserContext,
  leadingComments?: Comment[],
): ObjectExpression | null {
  if (peek(context) !== '{') {
    return null;
  }

  const start = context.position;
  pop(context);

  const leadingInnerComments = parseCommentsUntilBlankLine(context);
  let leadingElementComments = parseComments(context);

  if (peek(context) === '}') {
    pop(context);
    // empty object
    return {
      type: 'object',
      properties: [],
      start,
      end: context.position,
      rawText: context.text.slice(start.offset, context.position.offset),
      value: {},
      leadingComments,
      leadingInnerComments:
        leadingInnerComments || leadingElementComments
          ? [...(leadingInnerComments || []), ...(leadingElementComments || [])]
          : undefined,
    };
  }

  const properties: ObjectProperty[] = [];
  let lastProperty: ObjectProperty | undefined = undefined;
  const value: JsonObject = {};

  while (true) {
    if (lastProperty != null) {
      consume(context, ',');

      const commentsUntilBlank = parseCommentsUntilBlankLine(context);
      const otherComments = parseComments(context);

      if (otherComments && commentsUntilBlank) {
        leadingElementComments = otherComments;
        appendTrailingComments(lastProperty, commentsUntilBlank);
      } else {
        leadingElementComments = commentsUntilBlank || otherComments;
      }

      if (peek(context) === '}') {
        assert(context, supportTrailingCommas);
        break;
      }
    }

    lastProperty = parseObjectProperty(context, leadingElementComments);
    leadingElementComments = undefined;
    appendTrailingComments(lastProperty, parseComments(context));

    properties.push(lastProperty);
    value[lastProperty.key.value] = lastProperty.value.value;

    if (peek(context) === '}') {
      break;
    }
  }

  next(context);

  return {
    type: 'object',
    start,
    end: context.position,
    rawText: context.text.slice(start.offset, context.position.offset),
    properties,
    value,
    leadingComments,
    leadingInnerComments,
    trailingInnerComments: leadingElementComments,
  };
}

function parseObjectProperty(context: ParserContext, leadingComments?: Comment[]): ObjectProperty {
  const start = context.position;

  const key = tryParseStringLiteral(context) || tryParseIdentifier(context);

  if (key == null) {
    throw new InvalidJsonError('Invalid character', context);
  }

  appendTrailingComments(key, parseComments(context));

  consume(context, ':');

  const value = parseExpression(context, parseComments(context));

  return {
    type: 'object property',
    start,
    end: context.position,
    rawText: context.text.slice(start.offset, context.position.offset),
    key,
    value,
    leadingComments,
  };
}

function tryParseIdentifier(
  context: ParserContext,
  leadingComments?: Comment[],
): Identifier | null {
  const firstChar = peek(context);
  const start = context.position;

  if (!supportIdentifiers(context) || !firstChar) {
    return null;
  }

  if (DIGITS.includes(firstChar)) {
    const identifierNode = tryParseNumberLiteral(context)!;

    return {
      type: 'identifier',
      start,
      end: identifierNode.end,
      rawText: identifierNode.rawText,
      value: identifierNode.value.toString(),
    };
  }

  if (!IDENTIFIER_CHARACTER.includes(firstChar)) {
    return null;
  }

  while (IDENTIFIER_CHARACTER.includes(peek(context)!)) {
    next(context);
  }

  const value = context.text.slice(start.offset, context.position.offset);

  return {
    type: 'identifier',
    start,
    end: context.position,
    rawText: value,
    value,
    leadingComments,
  };
}
