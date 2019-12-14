import { Project, CallExpression, ParameterDeclaration, FunctionDeclaration, SourceFile } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';
import { PageModel, Dependency } from '../interfaces';
import {camelCase, upperFirst} from 'lodash';
import { renderPage } from './pageRender';
import { getWidgetImports } from './pageImports';
import { ENCODING_UTF8 } from '../util';
import { getPagePath } from './pageUtil';
import * as logger from '../logger';

/**
 * 
 * @param project 
 * @param dependences 
 * @param pageModels 
 * @returns {boolean} 创建成功则返回 `true`，否则返回 `false`
 */
export function create(project: Project, dependences: Dependency[] = [], pageModels: PageModel[] = []): boolean {
	logger.info(`需生成 ${pageModels.length} 个页面。`);
	if(pageModels.length === 0) {
		return true;
	}

	const pageTemplate = readPageTemplate(project);

	// 放在 src/pages/{pageKey}/ 文件夹中
	return !pageModels.some((model, index)=> {
		return !createPage(project, dependences, pageTemplate, model, index);
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
	return fs.readFileSync(pageTemplatePath, ENCODING_UTF8);
}

/**
 * 创建页面
 * 
 * @param project ts-morph 项目
 * @param dependences 项目依赖列表
 * @param pageTemplate 页面模板的内容
 * @param pageModel 页面模型
 * 
 * @returns {boolean} 创建成功则返回 `true`，否则返回 `false`
 */
function createPage(project: Project, dependences: Dependency[], pageTemplate: string, pageModel: PageModel, index: number): boolean {
	// 修改文件名
	const pageFileName = getPagePath(pageModel.pageInfo);
	logger.info(`开始生成第 ${index + 1} 个页面 ${pageFileName}`)

	let sourceFile: SourceFile;
	try {
		sourceFile = project.createSourceFile(path.join(process.cwd(), pageFileName), pageTemplate);
	} catch (error) {
		logger.error(`创建源文件 ${pageFileName} 失败，文件已存在！`);
		return false;
	}

	// 修改属性名
	// 类名和属性名采用首字母大写的 camelCase 命名法
	const prefix = upperFirst(camelCase(pageModel.pageInfo.key));
	const propertiesInterface = sourceFile.getInterface('PageProperties');
	if (!propertiesInterface) {
		logger.error('在 Page.ts 模板文件中没有找到 PageProperties 属性接口定义');
		return false;
	}
	propertiesInterface.rename(`${prefix}Properties`);

	// 修改类名
	// 1. 获取 default export
	const defaultExportAssignment = sourceFile.getExportAssignment((d) => d.isExportEquals() === false);
	if (!defaultExportAssignment) {
		logger.error('在 Page.ts 模板文件中没有找到默认的导出语句。');
		return false;
	}
	// 2. 获取 factory 调用
	const factory = defaultExportAssignment.getExpression() as CallExpression;
	const funcArgs = factory.getArguments();
	if (funcArgs.length !== 1) {
		logger.error(
			`在 Page.ts 模板的 factory 函数中有且只能有一个参数，但现在有 ${funcArgs.length} 个参数。`
		);
		return false;
	}
	// 3. 往 factory 函数中传入的参数
	const firstParam = funcArgs[0];
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

	sourceFile.formatText();

	logger.info("完成。");
	return true;
}

