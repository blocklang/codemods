import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { Project } from 'ts-morph';
import { ProjectInfo, Dependency } from '../interfaces';

import * as packageJson from './packageJson';
import * as indexHtml from './indexHtml';
import * as routesTs from './routesTs';
import * as pageTs from './pageTs';

const project = new Project({
	tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json')
});

export function generate(modelDir: string = '') {
	console.log(modelDir);

	const content = fs.readFileSync(path.resolve(modelDir, 'project.json'), 'utf8');
	console.log(content);
	const projectInfo = JSON.parse(content) as ProjectInfo;
	console.log(projectInfo.name, projectInfo.version);

	const dependenceContent = fs.readFileSync(path.resolve(modelDir, 'dependences.json'), 'utf8');
	const dependences = JSON.parse(dependenceContent) as Dependency[];

	const pageModels = glob
		.sync(path.resolve(modelDir, 'pages/*.json'))
		.map((pagePath) => JSON.parse(fs.readFileSync(pagePath, 'utf8')));

	packageJson.update(projectInfo, dependences);
	indexHtml.update(projectInfo.label || projectInfo.name);
	routesTs.update(project, pageModels);
	pageTs.create(project, dependences, pageModels);

	project.saveSync();
	console.log('成功生成 Dojo App 代码');
}
