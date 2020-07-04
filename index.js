const {join} = require('path');

require('ts-node').register({
  project: join(__dirname, 'tsconfig.json'),
  files: true,
});

module.exports = require('./src/index.ts');
