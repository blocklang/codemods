import { Project, CallExpression, Node, SyntaxKind, ArrowFunction, ArrayLiteralExpression } from 'ts-morph';
import { PageModel } from '../interfaces';
import * as logger from "../logger";
import { join } from 'path';
import { getStateInterfacePropertyName } from './pageUtil';

export function update(project: Project, pageModels: PageModel[]): boolean {
    // 获取 src/processes/routeProcesses.ts 文件
    const routeProcessesTsFileName = "src/processes/routeProcesses.ts";
    logger.info(`开始修改 ${routeProcessesTsFileName} 文件`);
    const routeProcessTsPath = join(process.cwd(), routeProcessesTsFileName);
    const routeProcessTsSourceFile = project.getSourceFile(routeProcessTsPath);
    if(!routeProcessTsSourceFile) {
        logger.error(`在模板项目中没有找到 ${routeProcessesTsFileName} 文件`);
        return false;
    }

    const changeRouteCommandVariableDeclaration = routeProcessTsSourceFile.getVariableDeclaration("changeRouteCommand");
    if(!changeRouteCommandVariableDeclaration) {
        logger.error(`在 ${routeProcessesTsFileName} 文件中未定义 changeRouteCommand 命令`);
        return false;
    }

    
    const commandFactoryExpression = changeRouteCommandVariableDeclaration.getInitializer();
    
    if(!commandFactoryExpression 
        || !Node.isCallExpression(commandFactoryExpression)) {
        logger.error(`在 ${routeProcessesTsFileName} 文件中定义 changeRouteCommand 命令时未调用 commandFactory 函数`)
        return false;
    }
    const commandFactoryCallExpression = commandFactoryExpression as CallExpression;
    // 必须要加 trim() 去掉换行符
    if(commandFactoryCallExpression.getExpression().getFullText().trim() !== "commandFactory") {
        logger.error(`在 ${routeProcessesTsFileName} 文件中定义 changeRouteCommand 命令时未调用 commandFactory 函数`)
        return false;
    }

    const args = commandFactoryCallExpression.getArguments();
    if(args.length !== 1) {
        logger.error("commandFactory 函数中只能传入一个参数");
        return false;
    }

    const firstArg = args[0];
    if(!Node.isArrowFunction(firstArg)) {
        logger.error("commandFactory 的参数必须是箭头函数");
        return false;
    }

    const arrowFunction = firstArg as ArrowFunction;
    const returnStatement = arrowFunction.getBody().getLastChildByKind(SyntaxKind.ReturnStatement);
    if(!returnStatement) {
        logger.error("箭头函数中必须包含 return 语句");
        return false;
    }

    const returnExpression = returnStatement.getExpression();
    if(!returnExpression) {
        logger.error("箭头函数中必须包含 return 语句");
        return false;
    }

    const array = returnStatement.getExpression() as ArrayLiteralExpression;
    pageModels.forEach(pageModel => array.addElement(`replace(path('${getStateInterfacePropertyName(pageModel.pageInfo)}'), undefined)`))
    return true;
}