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

export function capitalize(value: string) {
	return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

/**
 * @function getChildrenIndex
 *
 * 获取 widgetId 对应部件的所有直属子部件的索引集合。
 *
 * @param treeNodes         数据列表
 * @param widgetId          部件 id
 * @param firstChildIndex   是第一个子部件的索引，从 firstChildIndex 位置开始查找
 *
 * @returns                 因为直属子部件的索引在列表中是不连续的，所以返回的是索引集合，而不是最后一个子部件的索引。
 */
export function getChildrenIndex<T extends { id: string; parentId: string }>(
	treeNodes: ReadonlyArray<T>,
	widgetId: string,
	firstChildIndex: number
): number[] {
	const result: number[] = [];
	const len = treeNodes.length;
	for (let i = firstChildIndex; i < len; i++) {
		if (treeNodes[i].parentId === widgetId) {
			result.push(i);
		}
	}
	return result;
}
