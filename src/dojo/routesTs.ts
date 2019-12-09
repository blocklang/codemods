import { PageInfo } from '../interfaces';
import { ArrayLiteralExpression, Project } from 'ts-morph';
import { join } from 'path';
import { getPageGroupPathes } from './pageUtil';

/**
 * 往 `src/routes.ts` 文件中追加 route config
 * 
 * @param project ts-morph 项目
 * @param pageModels 页面模型列表
 */
export function update(project: Project, pageInfos: PageInfo[] = []): boolean {
	const routesTsFileName = 'src/routes.ts';
	console.log(`开始更新 ${routesTsFileName} 文件`);

	const routesTsSourceFile = project.getSourceFile(join(process.cwd(), routesTsFileName));
	if (!routesTsSourceFile) {
		console.error(`在模板项目中没有找到 ${routesTsFileName} 文件`);
		return false;
	}
	const routesTsDefaultExport = routesTsSourceFile.getExportAssignment((d) => d.isExportEquals() === false);
	if (!routesTsDefaultExport) {
		console.error(`在 ${routesTsFileName} 文件中缺失默认的导出语句。`);
		return false;
	}

	const arrayLiteralExpression = routesTsDefaultExport.getExpression() as ArrayLiteralExpression;
	pageInfos.forEach((pageInfo: PageInfo) => updatePage(arrayLiteralExpression, pageInfo));

	routesTsSourceFile.formatText();
	console.log("更新完成。");
	return true;
}

function updatePage(arrayLiteralExpression: ArrayLiteralExpression, pageInfo: PageInfo): void {
	const path = getRoutePath(pageInfo);
	const outlet = getRouteOutlet(pageInfo);
	// {
	// 	path: '', // 使用 / 分割
	// 	outlet: 'home', // 使用 - 分割
	// 	defaultRoute: true
	// }
	arrayLiteralExpression.addElement((writer) => {
		writer.block(() => {
			writer
				.write('path: ')
				.quote()
				.write(path)
				.quote()
				.write(',')
				.newLine();
			writer
				.write('outlet: ')
				.quote()
				.write(outlet)
				.quote();

			if (isMainPage(pageInfo)) {
				writer
					.write(',')
					.newLine()
					.write('defaultRoute: true');
			}
		});
	});
}

/**
 * route outlet 的格式为 {groupPath1}-{groupPath2}-{key}
 * 
 */
export function getRouteOutlet({ groupPath = "", key = "" }: { groupPath: string, key: string }) {
	const groupPathes = getPageGroupPathes(groupPath);
	return groupPath === '' ? `${key}` : `${groupPathes.join('-')}-${key}`;
}

function getRoutePath({ groupPath = "", key = "" }: { groupPath: string, key: string }) {
	if (isMainPage({ groupPath, key })) {
		return '';
	}

	if (groupPath === '') {
		return key;
	}

	return `${groupPath}/${key}`;
}

function isMainPage({ groupPath = "", key = "" }: { groupPath: string, key: string }) {
	return groupPath === '' && key === 'main';
}
