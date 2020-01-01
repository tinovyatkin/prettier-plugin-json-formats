import {
  createJsonPlugin,
  getPropertyKeys,
  replacePropertyValue,
  sortObjectProperties,
  sortStringArray,
  combine,
  replacePropertyValues,
  deepSortObjectProperties,
} from './create-plugin';

const lifecycleScripts = [
  'install',
  'pack',
  'prepare',
  'publish',
  'restart',
  'shrinkwrap',
  'start',
  'stop',
  'test',
  'uninstall',
  'version',
];

function parseScriptName(name: string): {name: string; offset: number} {
  if (name.startsWith('pre')) {
    return {name: name.slice(3), offset: -0.4};
  } else if (name.startsWith('post')) {
    return {name: name.slice(4), offset: 0.4};
  } else {
    return {name, offset: 0};
  }
}

const sortScripts = sortObjectProperties(node =>
  getPropertyKeys(node).sort((_a, _b) => {
    const a = parseScriptName(_a);
    const b = parseScriptName(_b);

    if (lifecycleScripts.includes(a.name)) {
      if (lifecycleScripts.includes(b.name)) {
        return (
          lifecycleScripts.indexOf(a.name) +
          1 +
          a.offset -
          (lifecycleScripts.indexOf(b.name) + 1 + b.offset)
        );
      } else {
        return -1;
      }
    } else {
      if (lifecycleScripts.includes(b.name)) {
        return 1;
      } else {
        return a.name.localeCompare(b.name) || a.offset - b.offset;
      }
    }
  }),
);

export const packageJsonPlugin = createJsonPlugin({
  language: {name: 'package-json'},
  modifier: combine(
    // Sort the top-level object in a given order
    sortObjectProperties([
      'name',
      'version',
      'private',

      'description',
      'keywords',
      'homepage',
      'bugs',
      'repository',
      'license',
      'author',

      'bin',
      'man',
      'directovires',
      'files',
      'sideEffects',

      'workspaces',
      'scripts',

      'main',
      'umd:main',
      'jsdelivr',
      'unpkg',
      'module',
      'source',
      'jsnext:main',
      'browser',
      'types',
      'typings',
      'style',

      'dependencies',
      'bundledDependencies',
      'bundleDependencies',
      'optionalDependencies',
      'peerDependencies',
      'devDependencies',

      'engines',
      'publishConfig',
    ]),

    // Sort all properties that are objects alphabetically
    replacePropertyValues(deepSortObjectProperties()),
    // Sort scripts again using a different order
    replacePropertyValue('scripts', sortScripts),

    // Sort the bundled dependencies array of strings
    replacePropertyValue('bundleDependencies', sortStringArray),
    replacePropertyValue('bundledDependencies', sortStringArray),
  ),
});
