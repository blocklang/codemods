import { AttachedWidget, Dependency } from '../interfaces';
import { uniqWith, upperFirst, kebabCase } from 'lodash';

// 页面中的导入分两种：
// 1. UI 部件
// 2. 功能组件

/**
 * 获取页面使用的 UI 部件的导入信息
 *
 * @param buildDependences   项目依赖，这里已做过校验，不会存在多个实现了同一个 api 的依赖
 * @param widgets            页面部件列表
 */
export function getWidgetImports(
	buildDependences: Dependency[],
	widgets: AttachedWidget[] = []
): { defaultImport: string; moduleSpecifier: string }[] {
	if (widgets.length === 0) {
		return [];
	}

	// 一个部件在页面中会使用多次，这里进行去重处理
	const uniqWidgets = uniqWith(widgets, (c1, c2) => c1.apiRepoId === c2.apiRepoId && c1.widgetName === c2.widgetName);

	return uniqWidgets.map((item) => {
		const dep = buildDependences.find((buildDep) => buildDep.apiRepoId === item.apiRepoId);
		const packageName = dep.name;
		const widgetPath = kebabCase(item.widgetName);

		const defaultImport = upperFirst(item.widgetName);
		const moduleSpecifier = `${packageName}/${widgetPath}`;
		return { defaultImport, moduleSpecifier };
	});
}
