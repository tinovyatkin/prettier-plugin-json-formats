import {Expression, ObjectProperty} from '../parser';
import {ParserOptions, util} from 'prettier';

interface SkipOptions {
  backwards?: boolean;
}

const {skipNewline, hasNewline, isPreviousLineEmpty} = (util as unknown) as {
  skipNewline(text: string, index: number | false, opts?: SkipOptions): number | false;
  hasNewline(text: string, index: number, opts?: SkipOptions): boolean;
  isPreviousLineEmpty<N>(text: string, node: N, locStart: (node: N) => number): boolean;
};

function hasTrailingComment(node: Expression) {
  return !!node.trailingComments?.length;
}

function hasLeadingOwnLineComment(
  text: string,
  node: Expression | ObjectProperty,
  options: ParserOptions,
) {
  return !!node.leadingComments?.some(comment => hasNewline(text, options.locEnd(comment)));
}

export {hasNewline, skipNewline, isPreviousLineEmpty, hasLeadingOwnLineComment, hasTrailingComment};
