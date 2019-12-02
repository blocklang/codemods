import { PageInfo, PageModel } from '../interfaces';
import { ArrayLiteralExpression, Project } from 'ts-morph';
import { join } from 'path';
import * as fs from 'fs';

export function update(project: Project, pages: string[]): void {
	const routesTsPath = join(process.cwd(), 'src/routes.ts');
	const routesTsDefaultExport = project
		.getSourceFile(routesTsPath)
		.getExportAssignment((d) => d.isExportEquals() === false);
	const arrayLiteralExpression = routesTsDefaultExport.getExpression() as ArrayLiteralExpression;
	pages
		.map((pagePath) => JSON.parse(fs.readFileSync(pagePath, 'utf8')))
		.forEach((pageModel: PageModel) => updatePage(arrayLiteralExpression, pageModel.pageInfo));
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
