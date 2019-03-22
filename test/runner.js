module.exports = (() => {
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
