import {expect} from 'chai';
import fse from 'fs-extra';
import _ from 'lodash';
import yaml from 'js-yaml';

import {readConfig, DEFAULT_CONFIG} from '../dist/utils';
import {setupTestApp, teardownTestApp, checkFileOrDirExists} from './test_helpers';

describe("readConfig", function() {
  it("reads default configs if there is no config file", function() {
    let config = readConfig();

    expect(_.isEqual(config, DEFAULT_CONFIG)).to.equal(true);
  });

  describe("when user config is provided", function() {
    let dummyConfigPath = './mantra_cli.yaml';

    before(function() {
      fse.outputFileSync(dummyConfigPath, 'tabSize: 4');
    });

    after(function() {
      fse.removeSync(dummyConfigPath);
    });

    it("returns a config with values overwritten with user config", function() {
      let config = readConfig();
      expect(config.tabSize).to.equal(4);
    });
  });
});
