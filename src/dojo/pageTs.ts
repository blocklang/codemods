import { Project, CallExpression, ParameterDeclaration, FunctionDeclaration, CodeBlockWriter } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';
import { PageModel, AttachedWidgetProperty, AttachedWidget } from '../interfaces';
import { capitalize } from '../util';
import { renderPage } from './pageRender';

export function create(project: Project, pageModels: PageModel[]): void {
	const pageTemplate = readPageTemplate(project);

	// 放在 src/pages/{pageKey}/ 文件夹中
	pageModels.forEach((model) => {
		createPage(project, pageTemplate, model);
	});
}

/**
 * 读取页面模板
 *
 * @param project ts 项目
 * @returns 页面模板内容
 */
function readPageTemplate(project: Project): string {
	const pageTemplatePath = path.join(__dirname, '..', 'templates', 'Page.ts');
	return fs.readFileSync(pageTemplatePath, 'utf8');
}

function createPage(project: Project, pageTemplate: string, pageModel: PageModel): void {
	// 修改文件名
	const pageFileName = path.join(process.cwd(), 'src', 'pages', pageModel.pageInfo.key, `index.ts`);
	const sourceFile = project.createSourceFile(pageFileName, pageTemplate);

	// 修改属性名
	const prefix = capitalize(pageModel.pageInfo.key);
	sourceFile.getInterface('PageProperties').rename(`${prefix}Properties`);

	// 修改类名
	// 1. 获取 default export
	const defaultExportAssignment = sourceFile.getExportAssignment((d) => d.isExportEquals() === false);
	// 2. 获取 factory 调用
	const factory = defaultExportAssignment.getExpression() as CallExpression;
	// 3. 往 factory 函数中传入的参数
	const firstParam = factory.getArguments()[0];
	const parameterDeclaration = firstParam as ParameterDeclaration;
	parameterDeclaration.rename(prefix);
	// 4. 添加 import 语句
	// TODO:
	// 5. 设置函数体
	const functionDeclaration = firstParam as FunctionDeclaration;
	functionDeclaration.setBodyText((writer) => {
		writer.writeLine('const { } = properties();');

		writer.write('return ');
		writer.write("v('div', {}, [");

		renderPage(writer, pageModel.widgets);

		writer.write(']);');
	});
}
