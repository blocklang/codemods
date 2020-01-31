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
    const groupPathes = pageInfo.groupPath.split("/").map(item => kebabCase(item));
    return path.join('src', 'pages', ...groupPathes, kebabCase(pageInfo.key), `index.ts`);
}

export function getPageGroupPathes(groupPath: string = "") {
    return groupPath === "" ? [] : groupPath.split("/");
}