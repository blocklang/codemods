import { PageInfo } from "../interfaces";
import * as path from "path";
import { kebabCase, camelCase, upperFirst, lowerFirst } from 'lodash';

/**
 * 文件路径采用 kebabCase 命名法
 * 
 * 如 `src/pages/group-a/page-a/index.ts`
 * 
 * @param pageInfo 页面基本信息
 */
export function getPagePath(pageInfo: PageInfo) {
    const {key, groupPath} = pageInfo;

    const groupPathes = groupPath.split("/").map(item => kebabCase(item));
    return path.join('src', 'pages', ...groupPathes, kebabCase(key), `index.ts`);
}

export function getPageGroupPathes(groupPath: string = "") {
    return groupPath === "" ? [] : groupPath.split("/");
}

/**
 * 生成在 `interfaces.d.ts` 中的 State 接口中的属性名
 * 
 * @param pageInfo 页面基本信息
 */
export function getStateInterfacePropertyName(pageInfo: PageInfo): string {
    const {key, groupPath} = pageInfo;
    
    if(groupPath.trim() === "") {
        return camelCase(key);
    }
    const convertedGroupPath = groupPath.split("/").map(item => upperFirst(camelCase(item))).join("");
    return lowerFirst(convertedGroupPath) + upperFirst(camelCase(key));
}

/**
 * 生成在 `interfaces.d.ts` 中的 State 接口中的属性类型
 * 
 * @param pageInfo 页面基本信息
 */
export function getStateInterfacePropertyType(pageInfo: PageInfo): string {
    const {key, groupPath} = pageInfo;

    const convertedGroupPath = groupPath.split("/").map(item => upperFirst(camelCase(item))).join("");
    return convertedGroupPath + upperFirst(camelCase(key));
}