import * as yargs from 'yargs';

type TargetLibrary = 'dojo';
const targetLibrary: ReadonlyArray<TargetLibrary> = ['dojo'];

import * as dojo from './dojo';
export function init() {
	const argv = yargs.options({
		library: { type: 'string', alias: 'l', choices: targetLibrary, describe: '框架名，当前支持 dojo' },
		modelDir: { type: 'string', alias: 'd', describe: '存储应用程序模型的文件夹' }
	}).argv;
	if (argv.library === 'dojo') {
		dojo.generate(argv.modelDir);
	}
}
