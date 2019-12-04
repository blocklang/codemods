import { Project, CallExpression, ParameterDeclaration, FunctionDeclaration, SourceFile } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';
import { PageModel, Dependency } from '../interfaces';
import * as lodash from 'lodash';
import { renderPage } from './pageRender';
import { getWidgetImports } from './pageImports';

export function create(project: Project, dependences: Dependency[], pageModels: PageModel[]): void {
	const pageTemplate = readPageTemplate(project);

	// 放在 src/pages/{pageKey}/ 文件夹中
	pageModels.forEach((model) => {
		createPage(project, dependences, pageTemplate, model);
	});
}

/**
 * 读取页面模板
 *
 * @param project ts 项目
 * @returns 页面模板内容
 */
function readPageTemplate(project: Project): string {
	const pageTemplatePath = path.join(__dirname, '..', 'templates', 'dojo', 'Page.ts');
	return fs.readFileSync(pageTemplatePath, 'utf8');
}

function createPage(project: Project, dependences: Dependency[], pageTemplate: string, pageModel: PageModel): void {
	// 修改文件名
	const pageFileName = path.join(process.cwd(), 'src', 'pages', pageModel.pageInfo.key, `index.ts`);
	let sourceFile: SourceFile;
	try {
		sourceFile = project.createSourceFile(pageFileName, pageTemplate);
	} catch (error) {
		console.error(`创建源文件 ${pageFileName} 失败！`);
		return;
	}

	// 修改属性名
	const prefix = lodash.upperFirst(pageModel.pageInfo.key);
	const propertiesInterface = sourceFile.getInterface('PageProperties');
	if (propertiesInterface) {
		propertiesInterface.rename(`${prefix}Properties`);
	} else {
		console.warn('在 Page.ts 模板文件中没有找到 PageProperties 属性接口定义');
	}

	// 修改类名
	// 1. 获取 default export
	const defaultExportAssignment = sourceFile.getExportAssignment((d) => d.isExportEquals() === false);
	if (defaultExportAssignment) {
		// 2. 获取 factory 调用
		const factory = defaultExportAssignment.getExpression() as CallExpression;
		if (factory.getArguments.length !== 1) {
			console.warn(
				`在 Page.ts 模板的 factory 函数中有且只能有一个参数，但现在有 ${factory.getArguments.length} 个参数。`
			);
			return;
		}
		// 3. 往 factory 函数中传入的参数
		const firstParam = factory.getArguments()[0];
		const parameterDeclaration = firstParam as ParameterDeclaration;
		parameterDeclaration.rename(prefix);
		// 4. 添加 import 语句
		sourceFile.addImportDeclarations(getWidgetImports(dependences, pageModel.widgets));
		// 5. 设置函数体
		const functionDeclaration = firstParam as FunctionDeclaration;
		functionDeclaration.setBodyText((writer) => {
			writer.writeLine('const { } = properties();');

			writer.write('return ');
			writer.write("v('div', {}, [").newLine();

			renderPage(writer, pageModel.widgets);

			writer.newLine().write(']);');
		});
	} else {
		console.warn('在 Page.ts 模板文件中没有找到默认的导出语句。');
	}
	sourceFile.formatText();
}
