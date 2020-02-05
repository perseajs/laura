const assert = require('assert');

let foo;
before(() => {
    foo = 'foo';
});

test('one', () => {
    assert(1);
});

test('two', () => {
    assert(false);
});

test('three', () => {
    assert(foo === 'foo');
});
