import * as fs from 'fs';
import { join } from 'path';
import * as jsdom from 'jsdom';
import * as prettier from 'prettier';
import { ENCODING_UTF8 } from '../util';

/**
 * 更新 index.html 页面
 *
 * 1. 修改 title 属性
 *
 * @param projectName 项目显示名
 */
export function update(projectName: string): boolean {
	console.log("开始更新 index.html 文件");
	// 获取 src/index.html 文件
	const indexHtmlPath = join(process.cwd(), 'src/index.html');
	try{
		const indexHtmlContent = fs.readFileSync(indexHtmlPath, ENCODING_UTF8);
		const dom = new jsdom.JSDOM(indexHtmlContent);
		dom.window.document.title = projectName;
		fs.writeFileSync(indexHtmlPath, prettier.format(dom.serialize(), { parser: 'html' }));
		return true;
	} catch(error) {
		console.error("更新 index.html 失败！");
		return false;
	}
}
