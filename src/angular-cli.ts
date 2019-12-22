import {
  createJsonPlugin,
  getPropertyKeys,
  isObjectExpression,
  JsonPlugin,
  replacePropertyValue,
  sortObjectProperties,
  combine,
} from './create-plugin';

const plugin = createJsonPlugin(
  {name: 'angular-cli'},
  combine(
    sortObjectProperties(['version', '$schema', 'newProjectRoot', 'projects', 'cli', 'schematics']),

    replacePropertyValue(
      'projects',
      sortObjectProperties((projects, options) => {
        if (!isObjectExpression(projects)) {
          return projects;
        }

        const keys = getPropertyKeys(projects).sort();

        const sortAtTheTop = parseProjectNamesOption((options as any).angularCliTopProjects);
        const sortAtTheBottom = parseProjectNamesOption((options as any).angularCliBottomProjects);

        return [
          ...keys.filter(key => sortAtTheTop.includes(key)),

          ...keys.filter(key => !sortAtTheTop.includes(key) && !sortAtTheBottom.includes(key)),

          ...keys.filter(key => sortAtTheBottom.includes(key)),
        ];
      }),
    ),

    replacePropertyValue('schematics', sortObjectProperties()),
  ),
);

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
