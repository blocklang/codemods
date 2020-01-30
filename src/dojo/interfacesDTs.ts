import { PageModel, PageDataItem} from '../interfaces';
import * as logger from '../logger';
import { join } from 'path';
import { Project, SourceFile } from 'ts-morph';
import {camelCase, upperFirst} from "lodash";

export function update(project: Project, pageModels: PageModel[]): boolean {
    // 1. 获取 src/interfaces.d.ts 文件
    const interfacesDTsFileName = 'src/interfaces.d.ts';
    logger.info(`开始生成 d.ts 类型声明文件`);
    const interfacesDTsPath = join(process.cwd(), interfacesDTsFileName);

    const interfacesDTsSourceFile = project.getSourceFile(interfacesDTsPath);
    if(!interfacesDTsSourceFile) {
        logger.error(`在模板项目中没有找到 ${interfacesDTsFileName} 文件`);
        return false;
    }

    const stateInterface = interfacesDTsSourceFile.getInterface("State");
    if(!stateInterface) {
        logger.error(`${interfacesDTsFileName} 文件中未定义 State 接口`);
        return false;
    }

    // 2. 为每个页面数据生成 interface
    pageModels.forEach((pageModel) => {
        if(pageModel.data.length <= 1) {
            return;
        }

        const camelCaseName = camelCase(pageModel.pageInfo.key);

        const pageInterfaceFilePath = join(process.cwd(), 'src', 'typing', pageModel.pageInfo.groupPath, `${camelCaseName}.d.ts`);
        let pageInterfaceSourceFile;
        try{
            pageInterfaceSourceFile = project.createSourceFile(pageInterfaceFilePath);
        }catch(error) {
            logger.error(`创建源文件 ${pageInterfaceFilePath} 失败，文件已存在！`);
            return false;
        }

        const rootInterfaceName = createPageInterfaces(pageInterfaceSourceFile, pageModel);
        pageInterfaceSourceFile.formatText();

        // 3. 在 State 中添加属性
        interfacesDTsSourceFile.addImportDeclaration({
            namedImports: [`${rootInterfaceName}`],
            moduleSpecifier: `./typing/${pageModel.pageInfo.groupPath?pageModel.pageInfo.groupPath+'/':''}${camelCaseName}`
        });
        stateInterface.addProperty({name: camelCaseName, type: rootInterfaceName});
    });

    interfacesDTsSourceFile.formatText();

    logger.info("完成。");
    return true;
}

function createPageInterfaces(pageInterfaceSourceFile: SourceFile, pageModel: PageModel): string {
    const rootInterfaceName = upperFirst(camelCase(pageModel.pageInfo.key));
    const cachedInterfaceNames: {[index: string]: number} = {};
    // 获取根节点的直属子节点
    createInterfaceForObject(pageModel.data[0]);
    return rootInterfaceName;

    function createInterfaceForObject(currentDataItem: PageDataItem): string{
        let interfaceName = getInterfaceName(currentDataItem);
        const pageInterfaceDeclaration = pageInterfaceSourceFile.insertInterface(0, { name: interfaceName });
        pageInterfaceDeclaration.setIsExported(true);

        pageModel.data.filter(dataItem => dataItem.parentId === currentDataItem.id).forEach(dataItem => {
            const propertyType = getInterfacePropertyType(dataItem);
            pageInterfaceDeclaration.addProperty({
                name: camelCase(dataItem.name),
                type: propertyType
            });
        });
        return interfaceName;
    }

    function getInterfaceName(currentDataItem: PageDataItem) {
        if (currentDataItem.parentId === "-1") {
            return rootInterfaceName;
        }

        if (cachedInterfaceNames[currentDataItem.name] === undefined) {
            cachedInterfaceNames[currentDataItem.name] = 0;
            return upperFirst(camelCase(currentDataItem.name));
        }
        
        cachedInterfaceNames[currentDataItem.name] += 1;
        return upperFirst(camelCase(currentDataItem.name)) + cachedInterfaceNames[currentDataItem.name];
    }

    function createInterfaceForArray(currentDataItem: PageDataItem): string {
        const children = pageModel.data.filter(dataItem => dataItem.parentId === currentDataItem.id).map(dataItem => getInterfacePropertyType(dataItem));
        const set = new Set(children);
        if(set.size === 0) {
            return "any[]";
        }

        if(set.size === 1) {
            return `${set.keys().next().value}[]`;
        }

        return `(${Array.from(set).join("|")})[]`;
    }

    function getInterfacePropertyType(dataItem: PageDataItem): string {
        const {type} = dataItem;

        if (type === "Object") {
            return createInterfaceForObject(dataItem);
        }

        if(type === "Array") {
            return createInterfaceForArray(dataItem);
        }

        if(type === "String") {
            return "string";
        }
    
        if(type === "Number") {
            return "number";
        }
    
        if(type === "Boolean") {
            return "boolean";
        }
    
        if(type === "Date") {
            return "string";
        }

        return "";
    }
}
