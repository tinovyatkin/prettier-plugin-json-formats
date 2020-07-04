import {doc, Doc, FastPath, Printer, ParserOptions} from 'prettier';
import {Node, Expression} from '../parser';
import {AstModifier} from '../interfaces';

const {concat, hardline, indent, join} = doc.builders;

type ExtendedNode =
  | Node
  | {
      type: 'JsonRoot';
      node: Node;
    };

function createPreprocessor(modifier: AstModifier) {
  return function preprocess(ast: Node, options: ParserOptions): ExtendedNode {
    ast = modifier(ast as Expression, options);
    return {...ast, type: 'JsonRoot', node: ast};
  };
}

function genericPrint(
  path: FastPath,
  _options: ParserOptions,
  print: (node: FastPath) => Doc,
): Doc {
  const node = path.getValue() as ExtendedNode;
  switch (node.type) {
    case 'JsonRoot':
      return concat([path.call(print, 'node'), hardline]);
    case 'array':
      return node.elements.length === 0
        ? '[]'
        : concat([
            '[',
            indent(
              concat([
                hardline,
                join(concat([',', hardline]), path.map(print, 'elements')),
              ]),
            ),
            hardline,
            ']',
          ]);
    case 'object':
      return node.properties.length === 0
        ? '{}'
        : concat([
            '{',
            indent(
              concat([
                hardline,
                join(concat([',', hardline]), path.map(print, 'properties')),
              ]),
            ),
            hardline,
            '}',
          ]);
    case 'object property':
      return concat([path.call(print, 'key'), ': ', path.call(print, 'value')]);
    case 'null':
      return 'null';
    case 'true':
      return 'true';
    case 'false':
      return 'false';
    case 'string':
    case 'number':
    case 'identifier':
      return JSON.stringify(node.value);
    default:
      /* istanbul ignore next */
      throw new Error('unknown type: ' + JSON.stringify((node as Node).type));
  }
}

function clean(node: Node /*, newNode: Node, parent*/): Node | void {
  if (node.type === 'identifier') {
    return {...node, type: 'string'};
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
