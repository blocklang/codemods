import { PageModel, PageInfo } from '../interfaces';
import { Project, CallExpression, FunctionDeclaration, ts, ArrayLiteralExpression } from 'ts-morph';
import { kebabCase, camelCase, upperFirst } from 'lodash';
import { join } from 'path';
import { getPageGroupPathes } from './pageUtil';
import { getRouteOutlet } from './routesTs';
import * as logger from '../logger';

export function update(project: Project, pageModels: PageModel[]): boolean {
    // 1. 添加 import 语句
    // 1.1. 获取 src/App.ts 文件
    const appTsFileName = 'src/App.ts';
    logger.info(`开始更新 ${appTsFileName} 文件`);
    const appTsPath = join(process.cwd(), appTsFileName);

    const sourceFile = project.getSourceFile(appTsPath);
    if (!sourceFile) {
        logger.error(`在模板项目中没有找到 ${appTsFileName} 文件`);
        return false;
    }
    sourceFile.addImportDeclarations(getPageImports(pageModels.map(model => model.pageInfo)));

    // 2. 添加 Outlet 部件
    // 2.1 找默认的导出语句
    const defaultExportAssignment = sourceFile.getExportAssignment((d) => d.isExportEquals() === false);
    if (!defaultExportAssignment) {
        logger.error(`在 ${appTsFileName} 文件中没有找到默认的导出语句。`);
        return false;
    }

    // 2.2 找出 factory 函数
    const factory = defaultExportAssignment.getExpression() as CallExpression;
    const funcArgs = factory.getArguments();
    if (funcArgs.length !== 1) {
        logger.error(
            `在 ${appTsFileName} 的 factory 函数中有且只能有一个参数，但现在有 ${funcArgs.length} 个参数。`
        );
        return false;
    }

    // 2.3 找出 factory 函数的第一个输入参数，是一个函数
    const firstParam = funcArgs[0];
    if(!(firstParam instanceof FunctionDeclaration)) {
        logger.error("should be 'export default factory(function App(){});'");
        return false;
    }
    const functionDeclaration = firstParam as FunctionDeclaration;
    // 2.4 找出上述函数的返回语句
    const functionBody = functionDeclaration.getBody();
    if (!functionBody) {
        logger.error(`在 ${appTsFileName} 的 factory 函数的第一个输入参数，是一个函数，但没有找到函数体。`);
        return false;
    }
    const returnStatement = functionBody.getLastChildByKind(ts.SyntaxKind.ReturnStatement);
    if (!returnStatement) {
        logger.error(`在 ${appTsFileName} 的 factory 函数的第一个输入参数，是一个函数，在函数体中没有找到返回语句。`);
        return false;
    }

    // 对应 v('div', { classes: [css.root] }, []);
    const v = returnStatement.getExpression() as CallExpression;
    if (!v) {
        logger.error(`在 ${appTsFileName} 的 factory 函数的第一个输入参数，是一个函数，在返回语句中没有找到 v() 语句。`);
        return false;
    }

    // 找到第三个输入参数 []，然后在其中写入 Outlet 部件
    const vArgs = v.getArguments();
    if (vArgs.length !== 3) {
        logger.error(`在 ${appTsFileName} 的 factory 函数的第一个输入参数，是一个函数，在返回语句的 v() 中必须有三个输入参数，但却有 ${vArgs.length} 个。`);
        return false;
    }

    const thirdArg = vArgs[2] as ArrayLiteralExpression;
    // w(Outlet, { id: 'home', renderer: () => w(Home, {}) })
    pageModels.forEach(model => {
        thirdArg.addElement(writer => {
            const pageInfo = model.pageInfo;
            const groupPathes = getPageGroupPathes(pageInfo.groupPath);
            const routeKey = getRouteOutlet(pageInfo);
            const widgetName = getWidgetDefaultImport(groupPathes, pageInfo);
            writer
                .newLine()
                .write('w(Outlet, { id: ')
                .quote().write(routeKey).quote()
                .write(", renderer: () => w(")
                .write(widgetName)
                .write(", {}) })");
        });
    });

    sourceFile.formatText();

    logger.info("更新完成。");
    return true;
}

export function getPageImports(pageInfos: PageInfo[] = []): { defaultImport: string; moduleSpecifier: string }[] {
    return pageInfos.map(pageInfo => {
        const groupPathes = getPageGroupPathes(pageInfo.groupPath);

        const defaultImport = getWidgetDefaultImport(groupPathes, pageInfo);
        let moduleSpecifier = getWidgetModuleSpecifier(groupPathes, pageInfo);

        return { defaultImport, moduleSpecifier };
    });
}

function getWidgetModuleSpecifier(groupPathes: string[], pageInfo: PageInfo) {
    if (groupPathes.length === 0) {
        return `./pages/${kebabCase(pageInfo.key)}`;
    }

    const kebabCaseGroupPath = groupPathes.map(eachPath => kebabCase(eachPath)).join("/");
    return `./pages/${kebabCaseGroupPath}/${kebabCase(pageInfo.key)}`;
}

function getWidgetDefaultImport(groupPathes: string[], pageInfo: PageInfo) {
    const upperCamelCaseGroupPath = groupPathes.map(eachPath => upperFirst(camelCase(eachPath))).join("");
    return `${upperCamelCaseGroupPath}${upperFirst(camelCase(pageInfo.key))}`;
}
