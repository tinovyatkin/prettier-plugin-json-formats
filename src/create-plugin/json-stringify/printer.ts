import {doc, Doc, FastPath, Printer, ParserOptions} from 'prettier';
import {AstModifier, Expression, Node} from '../interfaces';

const {concat, hardline, indent, join} = doc.builders;

type ExtendedNode =
  | Node
  | {
      type: 'JsonRoot';
      node: Node;
      comments: [];
    };

function createPreprocessor(modifier: AstModifier) {
  return function preprocess(ast: Node, options: ParserOptions): ExtendedNode {
    ast = modifier(ast as Expression, options);
    return {...ast, type: 'JsonRoot', node: ast, comments: []};
  };
}

function genericPrint(
  path: FastPath,
  _options: ParserOptions,
  print: (node: FastPath) => Doc,
): Doc {
  const node: ExtendedNode = path.getValue();
  switch (node.type) {
    case 'JsonRoot':
      return concat([path.call(print, 'node'), hardline]);
    case 'ArrayExpression':
      return node.elements.length === 0
        ? '[]'
        : concat([
            '[',
            indent(concat([hardline, join(concat([',', hardline]), path.map(print, 'elements'))])),
            hardline,
            ']',
          ]);
    case 'ObjectExpression':
      return node.properties.length === 0
        ? '{}'
        : concat([
            '{',
            indent(
              concat([hardline, join(concat([',', hardline]), path.map(print, 'properties'))]),
            ),
            hardline,
            '}',
          ]);
    case 'ObjectProperty':
      return concat([path.call(print, 'key'), ': ', path.call(print, 'value')]);
    case 'UnaryExpression':
      return concat([node.operator === '+' ? '' : node.operator, path.call(print, 'argument')]);
    case 'NullLiteral':
      return 'null';
    case 'BooleanLiteral':
      return node.value ? 'true' : 'false';
    case 'StringLiteral':
    case 'NumericLiteral':
      return JSON.stringify(node.value);
    case 'Identifier':
      return JSON.stringify(node.name);
    default:
      /* istanbul ignore next */
      throw new Error('unknown type: ' + JSON.stringify((node as Node).type));
  }
}

function clean(node: Node, newNode: Node /*, parent*/) {
  if (node.type === 'Identifier') {
    return {type: 'StringLiteral', value: node.name};
  }
  if (node.type === 'UnaryExpression' && node.operator === '+') {
    return (newNode as typeof node).argument;
  }

  return;
}

export function createPrinter(modifier: AstModifier): Printer {
  return {
    preprocess: createPreprocessor(modifier),
    print: genericPrint,
    massageAstNode: clean,
  } as Printer;
}
