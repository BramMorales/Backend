const { suma } = require('../utils/math');

test('suma dos números', () => {
  expect(suma(2, 3)).toBe(5);
});
