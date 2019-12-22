import {
  BooleanLiteral,
  Identifier,
  NullLiteral,
  NumberLiteral,
  SourceLocation,
  StringLiteral,
  UnaryExpression,
  Comment,
} from '@babel/types';
import {ParserOptions, SupportLanguage, Parser, Printer, SupportOption} from 'prettier';

export {
  BooleanLiteral,
  Identifier,
  isBooleanLiteral,
  isIdentifier,
  isNullLiteral,
  isNumberLiteral,
  isStringLiteral,
  isUnaryExpression,
  NullLiteral,
  NumberLiteral,
  SourceLocation,
  StringLiteral,
  UnaryExpression,
  Comment,
} from '@babel/types';

export type Node =
  | ObjectExpression
  | ObjectProperty
  | ArrayExpression
  | StringLiteral
  | NumberLiteral
  | NullLiteral
  | BooleanLiteral
  | Identifier
  | UnaryExpression;

export type Literal = StringLiteral | NumberLiteral | NullLiteral | BooleanLiteral | Identifier;
export type Expression = ObjectExpression | ArrayExpression | UnaryExpression | Literal;

export interface BaseNode {
  leadingComments: ReadonlyArray<Comment> | null;
  innerComments: ReadonlyArray<Comment> | null;
  trailingComments: ReadonlyArray<Comment> | null;
  start: number | null;
  end: number | null;
  loc: SourceLocation | null;
  type: Node['type'];
}

export interface ArrayExpression extends BaseNode {
  type: 'ArrayExpression';
  elements: Array<Expression>;
}

export interface ObjectExpression extends BaseNode {
  type: 'ObjectExpression';
  properties: Array<ObjectProperty>;
}

export interface ObjectProperty extends BaseNode {
  type: 'ObjectProperty';
  key: StringLiteral | Identifier;
  value: Expression;
  computed: boolean;
  shorthand: boolean;
  decorators: null;
}

export function isArrayExpression(node: Node): node is ArrayExpression {
  return node.type === 'ArrayExpression';
}

export function isObjectExpression(node: Node): node is ObjectExpression {
  return node.type === 'ObjectExpression';
}

export function isObjectProperty(node: Node): node is ObjectProperty {
  return node.type === 'ObjectProperty';
}

export interface AstModifier<T extends Node = Expression, R extends Node = T> {
  (node: T, options: ParserOptions): R;
}

export type CustomLanguage = Omit<SupportLanguage, 'parsers'>;

export interface JsonPlugin {
  languages: SupportLanguage[];

  options?: Record<string, SupportOption>;

  parsers: Record<string, Parser>;
  printers: Record<string, Printer>;
}
