import { Project, VariableDeclarationKind } from "ts-morph";
import { PageModel } from '../interfaces';
import * as logger from '../logger';
import { camelCase } from 'lodash';
import { join } from 'path';
import { toJsonObject } from '../util';
import * as stringifyObject from "stringify-object";
import { getModuleSpecifier } from './pageUtil';

export function create(project: Project, pageModels: PageModel[]): boolean {
    logger.info("开始创建 processes 文件");
    if (pageModels.length === 0) {
        logger.info("共发现 0 个页面。");
        return true;
    }

    pageModels.forEach(pageModel => {
        // 如果只有根节点，则不生成 process 文件
        if (pageModel.data.length <= 1) {
            return;
        }

        const camelCaseName = camelCase(pageModel.pageInfo.key);
        const processesFilePath = join(process.cwd(), 'src', 'processes', pageModel.pageInfo.groupPath, `${camelCaseName}Processes.ts`);

        let processesSourceFile;
        try {
            processesSourceFile = project.createSourceFile(processesFilePath);
        } catch (error) {
            logger.error(`创建源文件 ${processesFilePath} 失败，文件已存在！`);
            return false;
        }

        // 添加 import { commandFactory } from "./utils";
        // 添加 import { add } from "@dojo/framework/stores/state/operations";
        // 添加 import { createProcess } from "@dojo/framework/stores/process";
        processesSourceFile.addImportDeclaration({ moduleSpecifier: getModuleSpecifier("utils", pageModel.pageInfo.groupPath), namedImports: ["commandFactory"] });
        processesSourceFile.addImportDeclaration({ moduleSpecifier: "@dojo/framework/stores/state/operations", namedImports: ["add"] });
        processesSourceFile.addImportDeclaration({ moduleSpecifier: "@dojo/framework/stores/process", namedImports: ["createProcess"] });

        /*
        const initDataCommand = commandFactory(({path}) => {
            return [add(path("xx"), {})];
        });
        */

        const pageDataJson = toJsonObject(pageModel.data);
        processesSourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            declarations: [{
                name: "initDataCommand",
                initializer: (writer) => {
                    writer.write("commandFactory(").write("({path}) => ").inlineBlock(() => {
                        writer.write("const pageData = ")
                            .write(`${stringifyObject(pageDataJson, {indent: "    ",singleQuotes: false})};`)
                            .newLine()
                            .writeLine(`return [add(path("${camelCase(pageModel.pageInfo.key)}"), pageData)];`)
                    }).write(")");
                }
            }]
        });

        const processesStatement = processesSourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            declarations: [{
                name: "initDataProcess",
                initializer: `createProcess("init-data-process", [initDataCommand])`
            }]
        });
        processesStatement.setIsExported(true);

        processesSourceFile.formatText();

    });

    logger.info("完成。");
    return true;
}