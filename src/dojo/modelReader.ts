import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { ProjectInfo, Dependency, PageModel } from '../interfaces';

const ENCODING_UTF8 = 'utf8';
const PROJECT_INFO = 'project.json';
const DEPENDENCES_INFO = 'dependences.json';

/**
 * 读取项目基本信息
 * 
 * @param modelDir 存放应用程序模型的文件夹，是相对于 process.cwd() 的相对路径。
 */
export function readProjectJson(modelDir: string): ProjectInfo | undefined {
    const filePath = path.resolve(modelDir, PROJECT_INFO);
    if (!fs.existsSync(filePath)) {
        console.error(`${filePath} 不存在！`);
        return;
    }
    const content = fs.readFileSync(filePath, ENCODING_UTF8);
    try{
        return JSON.parse(content) as ProjectInfo;
    }catch(error) {
        console.error(error);
    }
}

/**
 * 读取项目依赖信息，其中包括保准库和用户配置的依赖
 * 
 * @param modelDir 存放应用程序模型的文件夹，是相对于 process.cwd() 的相对路径。
 */
export function readDependencesJson(modelDir: string): Dependency[] | undefined {
    const filePath = path.resolve(modelDir, DEPENDENCES_INFO);
    if (!fs.existsSync(filePath)) {
        console.error(`${filePath} 不存在！`);
        return;
    }
    const dependenceContent = fs.readFileSync(filePath, ENCODING_UTF8);
    try {
        return JSON.parse(dependenceContent) as Dependency[];
    } catch (error) {
        console.error(error);
    }
}

/**
 * 读取项目中所有的页面模型。
 * 
 * 调用此方法前，要先校验 pages/*.json 文件内容是不是有效的 json
 * 
 * @param modelDir 存放应用程序模型的文件夹，是相对于 process.cwd() 的相对路径。
 */
export function readAllPageModels(modelDir: string): PageModel[] {
    return glob
        .sync(path.resolve(modelDir, 'pages/*.json'))
        .map((pagePath) => JSON.parse(fs.readFileSync(pagePath, ENCODING_UTF8)));
}
