import * as spawn from 'cross-spawn';

export function runSync(command: string, args: string[] = []) {
	let stdout = '';
	let stderr = '';
	const proc = spawn.sync(command, args, { stdio: 'inherit' });
	const { status } = proc;
	if (status === 1) {
		process.exit(1);
	}
}

export function runTaskSync() {}
