import {
  createJsonPlugin,
  getPropertyKeys,
  JsonPlugin,
  replacePropertyValue,
  sortObjectProperties,
  combine,
  replacePropertyValues,
  renameProperty,
  deepSortObjectProperties,
} from './create-plugin';
import {ParserOptions} from 'prettier';

interface AngularCliParserOptions extends ParserOptions {
  angularCliTopProjects: string;
  angularCliBottomProjects: string;
}

const plugin = createJsonPlugin({
  language: {name: 'angular-cli'},
  modifier: combine(
    sortObjectProperties(['$schema', 'version', 'newProjectRoot', 'projects', 'cli', 'schematics']),

    replacePropertyValue(
      'projects',
      combine(
        sortObjectProperties((projects, options) => {
          const keys = getPropertyKeys(projects).sort();

          const sortAtTheTop = parseProjectNamesOption(
            (options as AngularCliParserOptions).angularCliTopProjects,
          );
          const sortAtTheBottom = parseProjectNamesOption(
            (options as AngularCliParserOptions).angularCliBottomProjects,
          );

          return [
            ...keys.filter(key => sortAtTheTop.includes(key)),

            ...keys.filter(key => !sortAtTheTop.includes(key) && !sortAtTheBottom.includes(key)),

            ...keys.filter(key => sortAtTheBottom.includes(key)),
          ];
        }),

        replacePropertyValues(
          combine(
            renameProperty('targets', 'architect'),

            sortObjectProperties(['projectType', 'root', 'sourceRoot', 'architect', 'schematics']),

            replacePropertyValue(
              'architect',
              combine(
                deepSortObjectProperties(),
                sortObjectProperties(['builder', 'options', 'configurations', 'schematics']),
              ),
            ),

            replacePropertyValue('schematics', deepSortObjectProperties()),
          ),
        ),
      ),
    ),

    replacePropertyValue('schematics', deepSortObjectProperties()),
  ),
});

function parseProjectNamesOption(option: string) {
  return option
    .split(',')
    .map(project => project.trim())
    .filter(Boolean);
}

export const angularCliPlugin: JsonPlugin = {
  ...plugin,

  options: {
    angularCliTopProjects: {
      category: 'Angular CLI',
      default: '',
      type: 'path',
      description: 'Keys of projects to sort at the top',
    },
    angularCliBottomProjects: {
      category: 'Angular CLI',
      default: '',
      type: 'path',
      description: 'Keys of projects to sort at the bottom',
    },
  },
};
