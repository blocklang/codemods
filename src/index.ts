import * as yargs from 'yargs';

type TargetLibrary = 'dojo';
const targetLibrary: ReadonlyArray<TargetLibrary> = ['dojo'];

export function init() {
	const argv = yargs.options({ library: { type: 'string', alias: 'l', choices: targetLibrary } }).argv;
	if (argv.library === 'dojo') {
		console.log('aaa');
	}
}
