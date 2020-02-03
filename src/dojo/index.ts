import * as path from 'path';
import { Project } from 'ts-morph';

import * as modelReader from './modelReader';
import * as packageJson from './packageJson';
import * as indexHtml from './indexHtml';
import * as routesTs from './routesTs';
import * as pageTs from './pageTs';
import * as interfaceDTs from './interfacesDTs';
import * as processesTs from './processesTs';
import * as routeProcessesTs from './routeProcessesTs';
import * as appTs from './appTs';

import * as logger from '../logger';

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
	logger.info(`共有 ${pageModels.length} 个页面。`);

	if(!packageJson.update(projectInfo, dependences)) {
		process.exit(1);
		return;
	}

	if(!indexHtml.update(projectInfo.label || projectInfo.name)) {
		process.exit(1);
		return;
	}

	if(!routesTs.update(project, pageModels.map(model => model.pageInfo))) {
		process.exit(1);
		return;
	}

	if(!pageTs.create(project, dependences, pageModels)){
		process.exit(1);
		return;
	}

	if(interfaceDTs.update(project, pageModels)) {
		process.exit(1);
		return;
	}

	if(processesTs.create(project, pageModels)) {
		process.exit(1);
		return;
	}

	if(routeProcessesTs.update(project, pageModels)) {
		process.exit(1);
		return;
	}

	if(!appTs.update(project, pageModels)) {
		process.exit(1);
		return;
	}

	project.saveSync();

	logger.info('成功生成 Dojo App 代码!');
}
