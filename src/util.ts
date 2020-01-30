import { PageDataItem } from './interfaces';

export const ENCODING_UTF8 = 'utf8';

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

/**
 * 获取 dataId 对应的数据，根据 type 返回不同的数据类型。
 * 
 * 注意：此函数来自 designer-core/src/utils/pageDataUtil.ts 中的 getValue
 *
 * @param pageData   页面数据列表
 * @returns          返回对应的 json 对象
 */
export function toJsonObject(pageData: PageDataItem[]): any {
	if (pageData.length === 0) {
		return;
	}
	// 第一个节点是根节点
	const rootDataItem = pageData[0];

	function _getObjectValue(dataItem: PageDataItem) {
		const result: any = {};
		pageData
			.filter((item) => item.parentId === dataItem.id)
			.forEach((item) => {
				result[item.name] = _getValue(item);
			});
		return result;
	}

	function _getArrayValue(dataItem: PageDataItem) {
		const result: any[] = [];
		pageData
			.filter((item) => item.parentId === dataItem.id)
			.forEach((item) => {
				result.push(_getValue(item));
			});
		return result;
	}

	function _getValue(dataItem: PageDataItem) {
		if (dataItem.type === "Number") {
			return Number(dataItem.value);
		} else if (dataItem.type === "Boolean") {
			return Boolean(dataItem.value);
		} else if (dataItem.type === "Object") {
			return _getObjectValue(dataItem);
		} else if (dataItem.type === "Array") {
			return _getArrayValue(dataItem);
		}
		return dataItem.value;
	}

	return _getValue(rootDataItem);
}