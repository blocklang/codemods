import { PageInfo} from '../interfaces';
import { ArrayLiteralExpression, Project } from 'ts-morph';
import { join } from 'path';

/**
 * 往 `src/routes.ts` 文件中追加 route config
 * 
 * @param project ts-morph 项目
 * @param pageModels 页面模型列表
 */
export function update(project: Project, pageInfos: PageInfo[] = []): boolean {
	const routesTsFileName = 'src/routes.ts';
	const routesTsPath = join(process.cwd(), routesTsFileName);
	const routesTsSourceFile = project.getSourceFile(routesTsPath);
	if (!routesTsSourceFile) {
		console.error(`在模板项目中没有找到 ${routesTsFileName} 文件`);
		return false;
	}

	const routesTsDefaultExport = routesTsSourceFile.getExportAssignment((d) => d.isExportEquals() === false);
	if (!routesTsDefaultExport) {
		console.warn(`在 ${routesTsFileName} 文件中缺失默认的导出语句。`);
		return false;
	}
	const arrayLiteralExpression = routesTsDefaultExport.getExpression() as ArrayLiteralExpression;
	pageInfos.forEach((pageInfo: PageInfo) => updatePage(arrayLiteralExpression, pageInfo));

	routesTsSourceFile.formatText();
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

function getRouteOutlet(pageInfo: PageInfo) {
	return pageInfo.groupPath === '' ? `${pageInfo.key}` : `${pageInfo.groupPath}-${pageInfo.key}`;
}

function getRoutePath(pageInfo: PageInfo) {
	if(isMainPage(pageInfo)){
		return '';
	}

	if(pageInfo.groupPath === '') {
		return pageInfo.key;
	}

	return `${pageInfo.groupPath}/${pageInfo.key}`;
}

function isMainPage(pageInfo: PageInfo) {
	return pageInfo.groupPath === '' && pageInfo.key === 'main';
}

