import * as assert from 'assert';

describe('Extension Test Suite', () => {
	test('Sample test', () => {

		assert.equal(-1, [1, 2, 3].indexOf(5));
		assert.equal(-1, [1, 2, 3].indexOf(0));
	});
});
