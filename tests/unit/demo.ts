const { describe, it } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

describe('MyClass', () => {
	it('should have a name property when instantiated', () => {
		assert.isTrue(true);
	});
});
