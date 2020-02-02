import { CodeBlockWriter } from 'ts-morph';
import { PageModel, PageInfo } from '../interfaces';
import { flatMap, uniqBy} from "lodash";
import { getVariableNames } from '../util';
import { getStateInterfacePropertyName } from './pageUtil';

export function initPageData(writer: CodeBlockWriter, pageInfo: PageInfo): void {
    writer.write("const {get, path, executor} = store;")
        .newLine()
        .newLine()
        .write(`const pageData = get(path("${getStateInterfacePropertyName(pageInfo)}"));`)
        .newLine()
        .write("if(!pageData)").block(() => {
            writer.write("executor(initDataProcess)({});");
        })
        .newLine();
}

export function declareVariables(writer: CodeBlockWriter, pageModel: PageModel): void {
    const {widgets, data} = pageModel;

    if (data.length === 0 || widgets.length === 0) {
        return;
    }

    // 找出所有包含表达式的属性，属性的值只包含 dataId
    const isExprProps = flatMap(widgets, ({ properties }) => properties.filter(property => property.isExpr));
    if (isExprProps.length === 0) {
        return;
    }

    const stateInterfacePropertyName = getStateInterfacePropertyName(pageModel.pageInfo);
    const variableNames = getVariableNames(data);
    // 去掉重复的 dataId
    // const str = "1";
    // 1. 获取 dataId
    // 2. 生成变量名
    // 3. 获取变量值
    uniqBy(isExprProps, 'value').forEach(item => {
        const {value: dataId} = item;
        if(dataId == undefined) {
            return;
        }
        const variableName = variableNames.get(dataId);
        writer.write(`const ${variableName} = get(path("${stateInterfacePropertyName}", "${variableName}"));`).newLine();
    });
    writer.newLine();

}