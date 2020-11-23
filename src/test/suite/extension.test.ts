import * as assert from 'assert';
import * as extension from '../../extension';
import { ExtensionContext } from 'vscode';
// import * as fs from 'fs';
// import { mocked } from 'ts-jest/utils';

// jest.mock('fs');
// const mockfs = mocked(fs, true);

test('Sample test', () => {
	// mockfs.readFileSync.mockReturnValue("value");

	let context = {
		extensionPath: 'g:\\Code\\vscode-mcmodel-preview'
	} as ExtensionContext;

	const errors = extension.validateModel(context);
	assert.strictEqual(errors, '');
});
