import { PageDataItem } from './interfaces';
import {camelCase } from 'lodash';

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
 * 将以数组表示的数据转换为 json object。
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
	return getValue(pageData, rootDataItem.id);
}

/**
 * 获取 dataId 对应的数据，根据 type 返回不同的数据类型。
 * 
 * 注意：此函数来自 designer-core/src/utils/pageDataUtil.ts 中的 getValue
 *
 * @param pageData   页面数据列表
 * @param dataId     数据项标识
 * @returns          如果 dataId 为空字符串，或者在 pageData 中不存在指定的 dataId，则返回 undefined；否则返回对应的值
 */
export function getValue(pageData: PageDataItem[], dataId: string): any {
	if (dataId.trim() === "") {
		return;
	}
	const currentDataItem = pageData.find( item => item.id === dataId);
	if (!currentDataItem) {
		return;
	}

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

	return _getValue(currentDataItem);
}

/**
 * 获取变量名
 * 
 * 注意：在此处统一定义变量名
 * 
 * 此处返回的是由 dataId 和 变量名组成的键值对。
 */
export function getVariableNames(pageData: PageDataItem[]): Map<string, string> {
	// 避免出现同名
	const cachedNames: {[index: string]: number} = {};

	const map = new Map<string, string>();
	if(pageData.length === 0) {
		return map;
	}
	setNameForObject(pageData[0]);

	console.log(map)
	return map;

	function setNameForObject(currentDataItem: PageDataItem) {
		if(currentDataItem.parentId === "-1") {
			// 约定 root 的 name 为 $，但 camelCase 会删除 $
			map.set(currentDataItem.id, currentDataItem.name);
		} else {
			map.set(currentDataItem.id, generateName(currentDataItem.name));
		}

		pageData.filter(dataItem => dataItem.parentId === currentDataItem.id).forEach(dataItem => {
			setName(dataItem);
		});
	}

	function setName(currentDataItem: PageDataItem) {
		const {type} = currentDataItem;
		
		const parentDataItem = pageData.find(item => item.id === currentDataItem.parentId);
		if(parentDataItem && parentDataItem.type === "Array") {
			const children = pageData.filter(item => item.parentId === parentDataItem.id);
			const itemIndex = children.findIndex(item => item.id === currentDataItem.id);

			map.set(currentDataItem.id, `${generateName(parentDataItem.name + itemIndex)}`);

			pageData.filter(item => item.parentId === currentDataItem.id).forEach(dataItem => {
				setName(dataItem);
			});

		}else if(type === "Object") {
			setNameForObject(currentDataItem);
		} else if(type === "Array") {
			setNameForObject(currentDataItem);
		} else {
			map.set(currentDataItem.id, generateName(currentDataItem.name));
		}
	}

	function generateName(name: string) {
		const key = camelCase(name);
		if(cachedNames[key] === undefined) {
			cachedNames[key] = 0;
			return key;
		}

		cachedNames[key] += 1;
		return key + cachedNames[key];
	}
}