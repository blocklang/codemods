import * as yargs from 'yargs';

type TargetLibrary = 'dojo';
const targetLibrary: ReadonlyArray<TargetLibrary> = ['dojo'];

import * as dojo from './dojo';
export function init() {
	const argv = yargs.options({
		library: { type: 'string', alias: 'l', choices: targetLibrary },
		modelDir: { type: 'string', alias: 'd' }
	}).argv;
	if (argv.library === 'dojo') {
		dojo.generate(argv.modelDir);
	}
}
