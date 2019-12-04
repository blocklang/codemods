import * as path from 'path';
import { Project } from 'ts-morph';

import * as modelReader from './modelReader';
import * as packageJson from './packageJson';
import * as indexHtml from './indexHtml';
import * as routesTs from './routesTs';
import * as pageTs from './pageTs';

const project = new Project({
	tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json')
});

export function generate(modelDir: string = ''): void {
	const projectInfo = modelReader.readProjectJson(modelDir);
	if(!projectInfo){
		process.exit(1);
		return;
	}

	const dependences = modelReader.readDependencesJson(modelDir);
	if(!dependences){
		process.exit(1);
		return;
	}

	const pageModels = modelReader.readAllPageModels(modelDir);

	packageJson.update(projectInfo, dependences);
	indexHtml.update(projectInfo.label || projectInfo.name);
	routesTs.update(project, pageModels);
	pageTs.create(project, dependences, pageModels);

	project.saveSync();

	console.log('成功生成 Dojo App 代码');
}
