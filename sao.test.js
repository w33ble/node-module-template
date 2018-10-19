const { resolve } = require("path");
const test = require("ava");
const sao = require("sao");

const template = {
  fromPath: resolve(".")
};

const getPkg = res => JSON.parse(res.files["package.json"].contents.toString());

test("copyright has correct info", t => {
  return sao
    .mockPrompt(template, {
      username: "someuser",
      name: "Some User"
    })
    .then(res => {
      const thisYear = new Date().getFullYear();
      const content = res.files["LICENSE"].contents.toString();
      const headerText = content.match(/Copyright(.*)/)[1];
      t.not(headerText.indexOf(thisYear), -1);
      t.not(headerText.indexOf("github.com/someuser"), -1);
      t.not(headerText.indexOf("Some User"), -1);
    });
});

test("no test setup when none is selected", t => {
  return sao
    .mockPrompt(template, {
      tests: "none"
    })
    .then(res => {
      const pkg = getPkg(res);
      t.is(pkg.scripts["report-coverage"], undefined);
      t.is(pkg.scripts["test"], undefined);
      t.is(pkg.scripts["test:dev"], undefined);
      t.is(pkg.devDependencies.codecov, undefined);
      t.is(pkg.devDependencies.nyc, undefined);
    });
});

test("coverage reporting when ava is selected", t => {
  return sao
    .mockPrompt(template, {
      tests: "ava"
    })
    .then(res => {
      const pkg = getPkg(res);
      t.not(pkg.scripts["report-coverage"], undefined);
      t.not(pkg.scripts["test"], undefined);
      t.not(pkg.scripts["test:dev"], undefined);
      t.not(pkg.devDependencies.codecov, undefined);
      t.not(pkg.devDependencies.nyc, undefined);
    });
});

test("ava is included when selected", t => {
  return sao
    .mockPrompt(template, {
      tests: "ava"
    })
    .then(res => {
      const pkg = getPkg(res);
      t.not(pkg.scripts["test"].indexOf("ava"), -1);
      t.is(pkg.scripts["test"].indexOf("build"), -1);
      t.not(pkg.scripts["test:only"].indexOf("ava"), -1);
      t.not(pkg.scripts["test:dev"].indexOf("ava"), -1);
      t.not(pkg.devDependencies.ava, undefined);
    });
});

test("tapped is included when selected", t => {
  return sao
    .mockPrompt(template, {
      tests: "tapped"
    })
    .then(res => {
      const pkg = getPkg(res);
      t.not(pkg.scripts["test"].indexOf("node"), -1);
      t.is(pkg.scripts["test"].indexOf("build"), -1);
      t.not(pkg.scripts["test:only"].indexOf("node"), -1);
      t.not(pkg.devDependencies.tapped, undefined);
    });
});

test("includes test without esm", t => {
  return sao
    .mockPrompt(template, {
      esm: false,
      tests: "not none"
    })
    .then(res => {
      t.truthy(res.files["test/index.js"]);
    });
});

test("includes test with esm", t => {
  return sao
    .mockPrompt(template, {
      esm: true,
      tests: "not none"
    })
    .then(res => {
      t.truthy(res.files["test/index.mjs"]);
    });
});

test("no babel build when none is selected", t => {
  return sao
    .mockPrompt(template, {
      buildTarget: "none",
      tests: "ava"
    })
    .then(res => {
      const pkg = getPkg(res);
      // no babel config
      t.is(pkg.babel, undefined);
      // no build script
      t.is(pkg.scripts["build"], undefined);
      t.is(pkg.scripts["test"].indexOf("npm run build"), -1);
    });
});

test("includes babel build when selected", t => {
  const findEnvPreset = presets =>
    presets.find(preset => preset === "env" || preset[0] === "env");

  return sao
    .mockPrompt(template, {
      buildTarget: "6",
      tests: "ava"
    })
    .then(res => {
      const pkg = getPkg(res);
      // includes babel config
      t.not(pkg.babel, undefined);
      const config = findEnvPreset(pkg.babel.presets)[1];
      t.is(config.targets.node, "6");
      // includes build scripts
      t.not(pkg.scripts["build"], undefined);
      t.not(pkg.scripts["test"].indexOf("npm run build"), -1);
      t.not(pkg.scripts["test:only"].indexOf("npm run build"), -1);
    });
});

test("includes Dockerfile when selected", t => {
  return sao
    .mockPrompt(template, {
      docker: true,
    })
    .then(res => {
      t.truthy(res.files["Dockerfile"]);
      t.truthy(res.files[".dockerignore"]);
    });
})

test("skips Dockerfile when not selected", t => {
  return sao
    .mockPrompt(template, {
      docker: false,
    })
    .then(res => {
      t.is(res.files["Dockerfile"], undefined);
      t.is(res.files[".dockerignore"], undefined);
    });
})