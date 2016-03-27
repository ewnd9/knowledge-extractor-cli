'use strict';

const dir = process.cwd();

const Configstore = require('configstore');
const store = new Configstore('knowledge-extractor-cli');

const exec = require('child_process').exec;
const globby = require('globby');
const hasha = require('hasha');
const shuffle = require('lodash/shuffle');
const execa = require('execa');

let projectId;
let projectStore;

execa.shell('git remote -v | head -n 1 | awk \'{print $2}\'')
  .then(result => {
    const data = result.stdout.trim().split('/');

    projectId = `${data[data.length - 2]}-${data[data.length - 1]}`.replace(/\W/g, '-');
    projectStore = store.get(projectId) || {};

    return globby(process.argv[2] && process.argv[2].split(' ') || ['**/*.js', '!node_modules/**']);
  })
  .then(paths => {
    return Promise.all(paths.map(path => hasha.fromFile(path, { algorithm: 'md5' }).then(hash => ({ path, hash }))));
  })
  .then(files => {
    const pristine = files.filter(file => projectStore[file.path] !== file.hash);
    shuffle(pristine);

    console.log(`${pristine.length} left`);

    if (pristine.length > 0) {
      const cmd = `atom "${pristine[0].path}"`;

      console.log(`$ ${cmd}`);
      exec(cmd);

      projectStore[pristine[0].path] = pristine[0].hash;
      store.set(projectId, projectStore);
    }
  })
  .catch(err => console.log(err));
