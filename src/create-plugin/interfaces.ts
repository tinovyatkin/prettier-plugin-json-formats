import {
  arrayExpression as _arrayExpression,
  BooleanLiteral,
  Comment,
  Identifier,
  isArrayExpression as _isArrayExpression,
  isObjectExpression as _isObjectExpression,
  isObjectProperty as _isObjectProperty,
  NullLiteral,
  NumericLiteral,
  objectExpression as _objectExpression,
  objectProperty as _objectProperty,
  SourceLocation,
  StringLiteral,
  UnaryExpression,
} from '@babel/types';
import {ParserOptions} from 'prettier';

export {
  addComment,
  addComments,
  booleanLiteral,
  BooleanLiteral,
  Comment,
  CommentBlock,
  CommentLine,
  CommentTypeShorthand,
  Identifier,
  inheritInnerComments,
  inheritLeadingComments,
  inheritsComments,
  inheritTrailingComments,
  isBooleanLiteral,
  isIdentifier,
  isNullLiteral,
  isNumericLiteral,
  isStringLiteral,
  isUnaryExpression,
  nullLiteral,
  NullLiteral,
  numericLiteral,
  NumericLiteral,
  removeComments,
  SourceLocation,
  stringLiteral,
  StringLiteral,
  UnaryExpression,
} from '@babel/types';

export type Node =
  | ObjectExpression
  | ObjectProperty
  | ArrayExpression
  | StringLiteral
  | NumericLiteral
  | NullLiteral
  | BooleanLiteral
  | Identifier
  | UnaryExpression;

export type Literal = StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | Identifier;
export type Expression = ObjectExpression | ArrayExpression | UnaryExpression | Literal;

export interface BaseNode {
  leadingComments: readonly Comment[] | null;
  innerComments: readonly Comment[] | null;
  trailingComments: readonly Comment[] | null;
  start: number | null;
  end: number | null;
  loc: SourceLocation | null;
  type: Node['type'];
}

export interface ArrayExpression extends BaseNode {
  type: 'ArrayExpression';
  elements: Expression[];
}

export interface ObjectExpression extends BaseNode {
  type: 'ObjectExpression';
  properties: ObjectProperty[];
}

export interface ObjectProperty extends BaseNode {
  type: 'ObjectProperty';
  key: StringLiteral | Identifier;
  value: Expression;
  computed: boolean;
  shorthand: boolean;
  decorators: null;
}

export const isArrayExpression: (node: Node) => node is ArrayExpression = _isArrayExpression as any;
export const isObjectExpression: (
  node: Node,
) => node is ObjectExpression = _isObjectExpression as any;
export const isObjectProperty: (node: Node) => node is ObjectProperty = _isObjectProperty as any;

export const objectProperty: (
  key: StringLiteral | Identifier,
  value: Expression,
) => ObjectProperty = _objectProperty as any;
export const objectExpression: (
  entries: ObjectProperty[],
) => ObjectExpression = _objectExpression as any;
export const arrayExpression: (elements: Expression[]) => ArrayExpression = _arrayExpression as any;

export interface AstModifier<T extends Node = Expression, R extends Node = T> {
  (node: T, options: ParserOptions): R;
}
