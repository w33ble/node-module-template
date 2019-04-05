const path = require('path');
const assert = require('assert');
const sao = require('sao');
const test = require('./runner');

// path to saofile.js
const generator = path.join(__dirname, '..');

// test helpers
const getOutput = async answers => sao.mock({ generator }, answers);
const hasFile = (res, path) => res.fileList.includes(path);
const getPkg = async res => {
  const pkg = await res.readFile('package.json');
  return JSON.parse(pkg);
};

test('copyright has correct info', async () => {
  const res = await getOutput({
    username: 'someuser',
    name: 'Some User'
  });

  const thisYear = new Date().getFullYear();
  assert.ok(hasFile(res, 'LICENSE'), 'missing LICENSE file');

  const content = await res.readFile('LICENSE');
  const headerText = content.match(/Copyright(.*)/)[1];
  assert.notEqual(headerText.indexOf(thisYear), -1);
  assert.notEqual(headerText.indexOf('github.com/someuser'), -1);
  assert.notEqual(headerText.indexOf('Some User'), -1);
});

test('only lint when none is selected', async () => {
  const res = await getOutput({
    tests: 'none'
  })

  const pkg = await getPkg(res);
  assert.equal(pkg.scripts['report-coverage'], undefined);
  assert.equal(pkg.scripts['test'], 'npm run lint');
  assert.equal(pkg.scripts['test:dev'], undefined);
  assert.equal(pkg.devDependencies.codecov, undefined);
  assert.equal(pkg.devDependencies.nyc, undefined);
});

test('coverage reporting when ava is selected', async () => {
  const res = await getOutput({
    tests: 'ava'
  });

  const pkg = await getPkg(res);
  assert.notEqual(pkg.scripts['report-coverage'], undefined);
  assert.notEqual(pkg.scripts['test'], undefined);
  assert.notEqual(pkg.scripts['test:dev'], undefined);
  assert.notEqual(pkg.devDependencies.codecov, undefined);
  assert.notEqual(pkg.devDependencies.nyc, undefined);
});

test('ava is included when selected', async () => {
  const res = await getOutput({
    tests: 'ava'
  });

  const pkg = await getPkg(res);
  assert.notEqual(pkg.scripts['test'].indexOf('ava'), -1);
  assert.equal(pkg.scripts['test'].indexOf('build'), -1);
  assert.notEqual(pkg.scripts['test:only'].indexOf('ava'), -1);
  assert.notEqual(pkg.scripts['test:dev'].indexOf('ava'), -1);
  assert.notEqual(pkg.devDependencies.ava, undefined);
});

test('tapped is included when selected', async () => {
  const res = await getOutput({
    tests: 'tapped'
  });

  const pkg = await getPkg(res);
  assert.notEqual(pkg.scripts['test'].indexOf('node'), -1);
  assert.equal(pkg.scripts['test'].indexOf('build'), -1);
  assert.notEqual(pkg.scripts['test:only'].indexOf('node'), -1);
  assert.notEqual(pkg.devDependencies.tapped, undefined);
});

test('includes test without esm', async () => {
  const res = await getOutput({
    esm: false,
    tests: 'not none'
  })

  assert.ok(hasFile(res, 'test/index.js'), 'missing test file');
});

test('includes test with esm', async () => {
  const res = await getOutput({
    esm: true,
    tests: 'not none'
  });

  assert.ok(hasFile(res, 'test/index.mjs'), 'missing test file');
});

test('no babel build when none is selected', async () => {
  const res = await getOutput({
    buildTarget: 'none',
    tests: 'ava'
  });

  const pkg = await getPkg(res);
  // no babel config
  assert.equal(pkg.babel, undefined);
  // no build script
  assert.equal(pkg.scripts['build'], undefined);
  assert.equal(pkg.scripts['test'].indexOf('npm run build'), -1);
});

test('includes babel build when selected', async () => {
  const findEnvPreset = presets =>
    presets.find(preset => preset === 'env' || preset[0] === 'env');

  const res = await getOutput({
    buildTarget: '6',
    tests: 'ava'
  });

  const pkg = await getPkg(res);

  // includes babel config
  assert.notEqual(pkg.babel, undefined);
  const config = findEnvPreset(pkg.babel.presets)[1];
  assert.equal(config.targets.node, '6');

  // includes build scripts
  assert.notEqual(pkg.scripts['build'], undefined);
  assert.notEqual(pkg.scripts['test'].indexOf('npm run build'), -1);
  assert.notEqual(pkg.scripts['test:only'].indexOf('npm run build'), -1);
});

test('includes Dockerfile when selected', async () => {
  const res = await getOutput({
    docker: true,
  });

  assert.ok(hasFile(res, 'Dockerfile'), 'missing Dockerfile');
  assert.ok(hasFile(res, '.dockerignore'), 'missing .dockerignore');
});

test('skips Dockerfile when not selected', async () => {
  const res = await getOutput({
    docker: false,
  });

  assert.ok(!hasFile(res, 'Dockerfile'), 'includes Dockerfile');
  assert.ok(!hasFile(res, '.dockerignore'), 'includes .dockerignore');
});

test.exec();
