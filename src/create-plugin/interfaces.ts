import {ParserOptions} from 'prettier';
import {Node, Expression} from './parser';

export interface AstModifier<T extends Node = Expression, R extends Node = T> {
  (node: T, options: ParserOptions): R;
}
