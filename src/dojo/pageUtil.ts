import { PageInfo } from "../interfaces";
import * as path from "path";
import { kebabCase } from 'lodash';

/**
 * 文件路径采用 kebabCase 命名法
 * 
 * 如 `src/pages/group-a/page-a/index.ts`
 * 
 * @param pageInfo 页面基本信息
 */
export function getPagePath(pageInfo: PageInfo) {
    return path.join('src', 'pages', kebabCase(pageInfo.groupPath), kebabCase(pageInfo.key), `index.ts`);
}

export function getPageGroupPathes(groupPath: string = "") {
    return groupPath === "" ? [] : groupPath.split("/");
}