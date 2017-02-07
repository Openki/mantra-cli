import fs from 'fs';
import path from 'path';
import {execSync} from 'child_process';
import {outputFileSync} from 'fs-extra';
import shelljs from 'shelljs/shell';

import {checkFileExists, createDir, getFileContent, createFile, getLineBreak, getCustomConfig} from '../utils';
import {logger} from '../logger';

export default function create(appPath, options = {}) {
  if (checkFileExists(`${shelljs.pwd()}/.meteor`)) {
    console.log('You are already in a Meteor project');
    return;
  }

  if (!appPath) {
    console.log('Please supply the path of project');
    console.log('Run `mantra create --help` for more options.');
    return;
  }
  const lineBreak = getLineBreak();
  let appName = path.basename(appPath).replace(/\..*$/, '');

  createDir(`${appPath}`);

  if (process.env.NODE_ENV !== 'test') {
    logger.invoke('init');
    shelljs.set('-e');
    let currentPath = shelljs.pwd();
    shelljs.exec(`meteor create ${appPath}`, {silent: !options.verbose});
    shelljs.cd(appPath);
    shelljs.rm('-rf', ['client', 'server']);
    `kadira:flow-router${lineBreak}`.toEnd('.meteor/packages');
    shelljs.rm('-rf', ['client', 'server']);
    `reactive-dict${lineBreak}`.toEnd('.meteor/packages');
    shelljs.cd(currentPath);
  }

  createFile(`${__dirname}/../../templates/client/configs/context.js`,
           `${appPath}/client/configs/context.js`);
  createFile(`${__dirname}/../../templates/client/main.js`,
           `${appPath}/client/main.js`);
  createFile(`${__dirname}/../../templates/client/modules/core/index.js`,
           `${appPath}/client/modules/core/index.js`);
  createFile(`${__dirname}/../../templates/client/modules/core/routes.jsx`,
           `${appPath}/client/modules/core/routes.jsx`);
  createDir(`${appPath}/client/modules/core/containers`);
  createDir(`${appPath}/client/modules/core/configs`);
  createDir(`${appPath}/client/modules/core/libs`);
  createFile(`${__dirname}/../../templates/client/modules/core/actions/index.js`,
           `${appPath}/client/modules/core/actions/index.js`);
  createFile(`${__dirname}/../../templates/client/modules/core/components/main_layout.jsx`,
           `${appPath}/client/modules/core/components/main_layout.jsx`);
  createFile(`${__dirname}/../../templates/client/modules/core/components/home.jsx`,
           `${appPath}/client/modules/core/components/home.jsx`);

  createFile(`${__dirname}/../../templates/lib/collections/index.js`,
           `${appPath}/lib/collections/index.js`);
  createDir(`${appPath}/server/configs`);
  createFile(`${__dirname}/../../templates/server/main.js`,
           `${appPath}/server/main.js`);
  createFile(`${__dirname}/../../templates/server/methods/index.js`,
           `${appPath}/server/methods/index.js`);
  createFile(`${__dirname}/../../templates/server/publications/index.js`,
           `${appPath}/server/publications/index.js`);
  createFile(`${__dirname}/../../templates/package.tt`,
          `${appPath}/package.json`, {appName: appName});
  createFile(`${__dirname}/../../templates/gitignore.tt`,
          `${appPath}/.gitignore`);
  createFile(`${__dirname}/../../templates/eslintrc.tt`,
          `${appPath}/.eslintrc`);
  createFile(`${__dirname}/../../templates/babelrc.tt`,
          `${appPath}/.babelrc`);
  createFile(`${__dirname}/../../templates/.scripts/mocha_boot.tt`,
          `${appPath}/.scripts/mocha_boot.js`);

  // Generate storybook related files
  if (options.storybook) {
    createDir(`${appPath}/.storybook`);
    createFile(`${__dirname}/../../templates/.storybook/config.js`,
      `${appPath}/.storybook/config.js`);
    createFile(`${__dirname}/../../templates/.storybook/webpack.config.js`,
      `${appPath}/.storybook/webpack.config.js`);
    createDir(`${appPath}/client/modules/core/components/.stories`);
    createFile(`${__dirname}/../../templates/client/modules/core/components/.stories/index.js`,
      `${appPath}/client/modules/core/components/.stories/index.js`);
  }

  // Generate test directories
  createDir(`${appPath}/client/modules/core/containers/tests`);
  createDir(`${appPath}/client/modules/core/actions/tests`);
  createDir(`${appPath}/client/modules/core/components/tests`);

  // Generate config file
  let customConfig = getCustomConfig({ storybook: Boolean(options.storybook) });
  outputFileSync(`${appPath}/mantra_cli.yaml`, customConfig);

  if (process.env.NODE_ENV !== 'test') {
    logger.invoke('after_init');
    shelljs.set('-e');
    let currentPath = shelljs.pwd();
    shelljs.cd(appPath);
    shelljs.exec('npm install', {silent: !options.verbose});
    shelljs.cd(currentPath);
  }

  console.log('');
  console.log(`Created a new app using Mantra v0.2.0 at ${appPath}`);
  console.log('');
  console.log('To run your app:');
  console.log(`  cd ${appPath}`);
  console.log(`  meteor`);
  console.log('');
  console.log('For the full Mantra specifications, see: https://kadirahq.github.io/mantra');
}
