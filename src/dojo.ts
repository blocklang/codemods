import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { Project, ts, CallExpression, ParameterDeclaration, FunctionDeclaration } from 'ts-morph';
import * as pkgDir from 'pkg-dir';
import { join, resolve } from 'path';
import { ProjectInfo, PackageJson, Depencency } from './interfaces';
import * as spawn from 'cross-spawn';

const project = new Project({});

export function generate(modelDir: string) {
	console.log(modelDir);

	const content = fs.readFileSync(path.resolve(modelDir, 'project.json'), 'utf8');
	console.log(content);
	const projectInfo = JSON.parse(content) as ProjectInfo;
	console.log(projectInfo.name, projectInfo.version);

	// 调整 package.json 中的 name 和 version
	try {
		const packageJsonFilePath = join(process.cwd(), 'package.json');
		const packageJson = JSON.parse(fs.readFileSync(packageJsonFilePath, 'utf8')) as PackageJson;
		packageJson.name = projectInfo.name;
		packageJson.version = projectInfo.version;
		fs.writeFileSync(packageJsonFilePath, JSON.stringify(packageJson, null, 2));
	} catch (error) {
		throw Error('没有找到 package.json 文件，停止编译。');
	}

	// 使用 yarn 安装初始依赖
	console.log('安装初始依赖');
	const proc = spawn.sync('yarn', { stdio: 'inherit' });

	// 添加依赖
	const dependenceContent = fs.readFileSync(path.resolve(modelDir, 'dependences.json'), 'utf8');
	const dependences = JSON.parse(dependenceContent) as Depencency[];
	const pkgDeps = dependences.map(({ name, version }) => `${name}@${version}`);
	console.log('pkgDeps', pkgDeps);
	spawn.sync('yarn', ['add', ...pkgDeps], { stdio: 'inherit' });

	console.log('write success');

	// const path = resolve(process.cwd(), 'package.json');
	// console.log(path);

	// // 读取 page 源码模板
	// const pageTemplatePath = path.join(".");
	// console.log(pageTemplatePath);
	// const content = fs.readFileSync(path.join("_workspace","template", "Page.ts"), "utf8");
	// // 修改文件名
	// // 属性属性名
	// // 修改类名

	// project.getRootDirectories().forEach(item => {
	//     console.log(item.getPath())
	// })

	// console.log(project.getRootDirectories());

	// // const sourceFile = project.getSourceFileOrThrow("_workspace/template/Page.ts");
	// // console.log(sourceFile);

	// // project.getSourceFile("_workspace/template/Page.ts").copy("_workspace/project1/Page1.ts");
	// // const fileSystem = project.getFileSystem();
	// const pageFileName = "./_workspace/project1/Page1.ts";
	// const sourceFile = project.createSourceFile(pageFileName, content);

	// // sourceFile.getInterface("PageProperties").rename("Page1Properties");

	// sourceFile.saveSync();

	// const interface1 = project.getSourceFile(pageFileName).getInterface("PageProperties");
	// interface1.rename("Page1Properties");

	// const exportAssignments = project.getSourceFile(pageFileName).getExportAssignments();
	// const defaultExportAssignment = project.getSourceFile(pageFileName).getExportAssignment(d=> d.isExportEquals()===false);

	// const expr = defaultExportAssignment.getExpression() as CallExpression;
	// const a = expr.getArguments()[0] as ParameterDeclaration;
	// console.log(a.getName());
	// a.rename("Page1")

	// const func = expr.getArguments()[0] as FunctionDeclaration;
	// console.log(func.getBodyText());

	// func.setBodyText(writer => {
	//     writer.writeLine("const { } = properties();");

	//     writer.write("return ");
	//     writer.write("v('div', {}, [");
	//     writer.write("'a'");
	//     writer.write("]);");
	// });

	// // const {  } = properties();
	// // return v('div');

	// // project.getSourceFile(pageFileName).getFunction("Page").rename("Page1");

	// project.saveSync();
}
