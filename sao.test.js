const { resolve } = require('path');
const test = require('ava');
const sao = require('sao');

const template = {
  fromPath: resolve('.'),
};

const getPkg = (res) => JSON.parse(res.files['package.json'].contents.toString());

test('copyright has correct info', (t) => {
  return sao.mockPrompt(template, {
    username: 'someuser',
    name: 'Some User',
  })
  .then((res) => {
    const thisYear = new Date().getFullYear();
    const content = res.files['LICENSE'].contents.toString();
    const headerText = content.match(/Copyright(.*)/)[1];
    t.not(headerText.indexOf(thisYear), -1);
    t.not(headerText.indexOf('github.com/someuser'), -1);
    t.not(headerText.indexOf('Some User'), -1);
  });
});

test('no test setup when none is selected', (t) => {
  return sao.mockPrompt(template, {
    tests: 'none',
  })
  .then((res) => {
    const pkg = getPkg(res);
    t.is(pkg.scripts['report-coverage'], undefined);
    t.is(pkg.scripts['test'], undefined);
    t.is(pkg.scripts['test:dev'], undefined);
    t.is(pkg.devDependencies.codecov, undefined);
    t.is(pkg.devDependencies.nyc, undefined);
  });
});

test('coverage reporting when tests are selected', (t) => {
  return sao.mockPrompt(template, {
    tests: 'ava',
  })
  .then((res) => {
    const pkg = getPkg(res);
    t.not(pkg.scripts['report-coverage'], undefined);
    t.not(pkg.scripts['test'], undefined);
    t.not(pkg.scripts['test:dev'], undefined);
    t.not(pkg.devDependencies.codecov, undefined);
    t.not(pkg.devDependencies.nyc, undefined);
  });
});

test('ava is included when selected', (t) => {
  return sao.mockPrompt(template, {
    tests: 'ava',
  })
  .then((res) => {
    const pkg = getPkg(res);
    t.not(pkg.scripts['test'].indexOf('ava'), -1);
    t.not(pkg.scripts['test:dev'].indexOf('ava'), -1);
    t.not(pkg.devDependencies.ava, undefined);
  });
});
