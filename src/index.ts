import {JsonPlugin} from './create-plugin';

import {angularCliPlugin} from './angular-cli';
import {packageJsonPlugin} from './package-json';

function mergePlugins(...plugins: JsonPlugin[]): JsonPlugin {
  return plugins.reduce((a, b) => ({
    languages: [...a.languages, ...b.languages],
    parsers: {
      ...a.parsers,
      ...b.parsers,
    },
    printers: {
      ...a.printers,
      ...b.printers,
    },
    options: {
      ...a.options,
      ...b.options,
    },
  }));
}

export = mergePlugins(angularCliPlugin, packageJsonPlugin);
