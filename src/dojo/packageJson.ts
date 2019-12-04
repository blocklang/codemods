import * as fs from 'fs';
import { join } from 'path';
import * as spawn from 'cross-spawn';
import { ProjectInfo, Dependency, PackageJson } from '../interfaces';

/**
 * 更新 package.json 中的内容并安装依赖
 *
 * 1. 更新 name 属性
 * 2. 更新 version 属性
 * 3. 使用 yarn 安装初始依赖
 * 4. 使用 yarn 安装用户配置的依赖
 *
 * @param projectInfo 项目基本信息
 * @param dependences 项目依赖列表
 */
export function update(projectInfo: ProjectInfo, dependencies: Dependency[] = []): void {
	// 调整 package.json 中的 name 和 version
	try {
		const packageJsonFilePath = join(process.cwd(), 'package.json');
		const packageJson = JSON.parse(fs.readFileSync(packageJsonFilePath, 'utf8')) as PackageJson;
		packageJson.name = projectInfo.name;
		packageJson.version = projectInfo.version;
		fs.writeFileSync(packageJsonFilePath, JSON.stringify(packageJson, null, 2));
	} catch (error) {
		console.error('没有找到 package.json 文件，停止编译。');
		return;
	}

	// 使用 yarn 安装初始依赖
	console.log('安装初始依赖');
	let { status: yarnAddStatus } = spawn.sync('yarn', { stdio: 'inherit' });
	if (yarnAddStatus && yarnAddStatus !== 0) {
		console.error('初始依赖安装失败');
		process.exit(yarnAddStatus);
		return;
	}

	// 安装用户配置的依赖
	const pkgDeps = dependencies.map(({ name, version }) => `${name}@${version}`);
	console.log('pkgDeps', pkgDeps);
	const { status: yarnAddCustomStatus } = spawn.sync('yarn', ['add', ...pkgDeps], { stdio: 'inherit' });
	if (yarnAddCustomStatus && yarnAddCustomStatus !== 0) {
		console.error('用户配置的依赖安装失败');
		process.exit(yarnAddCustomStatus);
		return;
	}
}
