Laura
=====

`laura` is an intentionally simple test runner framework.

Really there is very little "framework" with less than 100 LOC, but since there is a smidge of lock-in if you use it, we shall call it a framework.

`laura` runs every test in a new process to help guarantee there is no interaction between tests. Processes are not re-used once a test has completed.

To define a test:

```javascript
const assert = require('assert');

test('thing() returns "foo"', () => {
  assert(thing(), 'foo');
});
```

To run tests:

```bash
$ yarn laura "\.test\.js$"
Passed examples/bar.test.js :: one in 0ms
Passed examples/bar.test.js :: two in 0ms
Passed examples/bar.test.js :: three in 0ms
Passed examples/foo.test.js :: one in 0ms
Passed examples/foo.test.js :: three in 0ms
Failed examples/foo.test.js :: two in 13ms
AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

  assert(false)

    at /Users/lawrence/projects/laura/examples/foo.test.js:8:5
    at test (/Users/lawrence/projects/laura/worker.js:8:19)
    at Object.<anonymous> (/Users/lawrence/projects/laura/examples/foo.test.js:7:1)
    at Module._compile (internal/modules/cjs/loader.js:936:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:947:10)
    at Module.load (internal/modules/cjs/loader.js:790:32)
    at Function.Module._load (internal/modules/cjs/loader.js:703:12)
    at Module.require (internal/modules/cjs/loader.js:830:19)
    at require (internal/modules/cjs/helpers.js:68:18)
    at Object.<anonymous> (/Users/lawrence/projects/laura/worker.js:21:1) {
  generatedMessage: true,
  code: 'ERR_ASSERTION',
  actual: false,
  expected: true,
  operator: '=='
}
5 / 6 tests passed in 69ms

$ # laura returns an exit code 0 on success and 1 on failure
```
