const { resolve } = require("path");
const assert = require("assert");
const sao = require("sao");

const template = {
  fromPath: resolve(".")
};

const test = (() => {
  const queue = [];

  function test(name, fn) {
    if (queue[name]) throw new Error(`Test with name '${name}' exists`);
    queue[name] = fn;
  }

  test.exec = async function testExec() {
    const entries = Object.entries(queue);

    return Promise.all(entries.map(([name, fn]) => {
      return Promise.resolve(fn())
      .then(res => {
        console.log(`PASSED: ${name}`);
      })
      .catch(e => {
        console.log(`FAILED: ${name}`);
        throw e;
      });
    }))
    .then(() => {
      console.log('ALL TESTS PASSED');
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      console.error('TESTS FAILED');
      process.exit(1);
    })
  }

  return test;
})();

const getPkg = res => JSON.parse(res.files["package.json"].contents.toString());

test("copyright has correct info", () => {
  return sao
    .mockPrompt(template, {
      username: "someuser",
      name: "Some User"
    })
    .then(res => {
      const thisYear = new Date().getFullYear();
      const content = res.files["LICENSE"].contents.toString();
      const headerText = content.match(/Copyright(.*)/)[1];
      assert.notEqual(headerText.indexOf(thisYear), -1);
      assert.notEqual(headerText.indexOf("github.com/someuser"), -1);
      assert.notEqual(headerText.indexOf("Some User"), -1);
    });
});

test("no test setup when none is selected", () => {
  return sao
    .mockPrompt(template, {
      tests: "none"
    })
    .then(res => {
      const pkg = getPkg(res);
      assert.equal(pkg.scripts["report-coverage"], undefined);
      assert.equal(pkg.scripts["test"], undefined);
      assert.equal(pkg.scripts["test:dev"], undefined);
      assert.equal(pkg.devDependencies.codecov, undefined);
      assert.equal(pkg.devDependencies.nyc, undefined);
    });
});

test("coverage reporting when ava is selected", () => {
  return sao
    .mockPrompt(template, {
      tests: "ava"
    })
    .then(res => {
      const pkg = getPkg(res);
      assert.notEqual(pkg.scripts["report-coverage"], undefined);
      assert.notEqual(pkg.scripts["test"], undefined);
      assert.notEqual(pkg.scripts["test:dev"], undefined);
      assert.notEqual(pkg.devDependencies.codecov, undefined);
      assert.notEqual(pkg.devDependencies.nyc, undefined);
    });
});

test("ava is included when selected", () => {
  return sao
    .mockPrompt(template, {
      tests: "ava"
    })
    .then(res => {
      const pkg = getPkg(res);
      assert.notEqual(pkg.scripts["test"].indexOf("ava"), -1);
      assert.equal(pkg.scripts["test"].indexOf("build"), -1);
      assert.notEqual(pkg.scripts["test:only"].indexOf("ava"), -1);
      assert.notEqual(pkg.scripts["test:dev"].indexOf("ava"), -1);
      assert.notEqual(pkg.devDependencies.ava, undefined);
    });
});

test("tapped is included when selected", () => {
  return sao
    .mockPrompt(template, {
      tests: "tapped"
    })
    .then(res => {
      const pkg = getPkg(res);
      assert.notEqual(pkg.scripts["test"].indexOf("node"), -1);
      assert.equal(pkg.scripts["test"].indexOf("build"), -1);
      assert.notEqual(pkg.scripts["test:only"].indexOf("node"), -1);
      assert.notEqual(pkg.devDependencies.tapped, undefined);
    });
});

test("includes test without esm", () => {
  return sao
    .mockPrompt(template, {
      esm: false,
      tests: "not none"
    })
    .then(res => {
      assert.ok(res.files["test/index.js"]);
    });
});

test("includes test with esm", () => {
  return sao
    .mockPrompt(template, {
      esm: true,
      tests: "not none"
    })
    .then(res => {
      assert.ok(res.files["test/index.mjs"]);
    });
});

test("no babel build when none is selected", () => {
  return sao
    .mockPrompt(template, {
      buildTarget: "none",
      tests: "ava"
    })
    .then(res => {
      const pkg = getPkg(res);
      // no babel config
      assert.equal(pkg.babel, undefined);
      // no build script
      assert.equal(pkg.scripts["build"], undefined);
      assert.equal(pkg.scripts["test"].indexOf("npm run build"), -1);
    });
});

test("includes babel build when selected", () => {
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
      assert.notEqual(pkg.babel, undefined);
      const config = findEnvPreset(pkg.babel.presets)[1];
      assert.equal(config.targets.node, "6");
      // includes build scripts
      assert.notEqual(pkg.scripts["build"], undefined);
      assert.notEqual(pkg.scripts["test"].indexOf("npm run build"), -1);
      assert.notEqual(pkg.scripts["test:only"].indexOf("npm run build"), -1);
    });
});

test("includes Dockerfile when selected", () => {
  return sao
    .mockPrompt(template, {
      docker: true,
    })
    .then(res => {
      assert.ok(res.files["Dockerfile"]);
      assert.ok(res.files[".dockerignore"]);
    });
})

test("skips Dockerfile when not selected", () => {
  return sao
    .mockPrompt(template, {
      docker: false,
    })
    .then(res => {
      assert.equal(res.files["Dockerfile"], undefined);
      assert.equal(res.files[".dockerignore"], undefined);
    });
})

test.exec();
