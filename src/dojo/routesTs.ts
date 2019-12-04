import { PageInfo, PageModel } from '../interfaces';
import { ArrayLiteralExpression, Project } from 'ts-morph';
import { join } from 'path';

export function update(project: Project, pageModels: PageModel[] = []): void {
	const routesTsFileName = 'src/routes.ts';
	const routesTsPath = join(process.cwd(), routesTsFileName);
	const routesTsSourceFile = project.getSourceFile(routesTsPath);
	if (!routesTsSourceFile) {
		console.error(`在模板项目中没有找到 ${routesTsFileName} 文件`);
		return;
	}

	const routesTsDefaultExport = routesTsSourceFile.getExportAssignment((d) => d.isExportEquals() === false);
	if (!routesTsDefaultExport) {
		console.warn(`在 ${routesTsFileName} 文件中缺失默认的导出语句。`);
		return;
	}
	const arrayLiteralExpression = routesTsDefaultExport.getExpression() as ArrayLiteralExpression;
	pageModels.forEach((pageModel: PageModel) => updatePage(arrayLiteralExpression, pageModel.pageInfo));
}

function updatePage(arrayLiteralExpression: ArrayLiteralExpression, pageInfo: PageInfo): void {
	const isMainPage = pageInfo.key === 'main';
	const path = isMainPage ? '' : pageInfo.key;
	const outlet = pageInfo.key;
	// {
	// 	path: '',
	// 	outlet: 'home',
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
			if (isMainPage) {
				writer.write(',').newLine();
				writer.write('defaultRoute: ').write('true');
			}
		});
	});
}
