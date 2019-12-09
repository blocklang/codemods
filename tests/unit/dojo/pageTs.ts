import { create } from "../../../src/dojo/pageTs";
import { InMemoryFileSystemHost } from '@ts-morph/common';
import { Project } from 'ts-morph';
import { PageModel } from '../../../src/interfaces';
import {stub} from 'sinon';

const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

let project: Project;

describe('dojo/pageTs', () => {

    beforeEach(() => {
        const fileSystem = new InMemoryFileSystemHost();
        fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "ES2015" } }`);
        project = new Project({tsConfigFilePath: "tsconfig.json", fileSystem});
    });

	it('create: default', () => {
		assert.isTrue(create(project, [], []));
    });
    
    it('create: src/pages/main/index.ts', () => {
        const cwdStub = stub(process, "cwd").returns("");
        const pageModels: PageModel[] = [{
            pageInfo: {
                id: 1,
                key: 'main',
                groupPath: ''
            },
            widgets: []
        }];
        assert.isTrue(create(project, [], pageModels));
        assert.isNotEmpty(project.getSourceFileOrThrow("src/pages/main/index.ts").getText());
        cwdStub.restore();
    });
    
    it('create: src/pages/ab-ab/ac-ac/index.ts', () => {
        const cwdStub = stub(process, "cwd").returns("");
        const pageModels: PageModel[] = [{
            pageInfo: {
                id: 1,
                key: 'AcAc',
                groupPath: 'AbAb'
            },
            widgets: []
        }];
        assert.isTrue(create(project, [], pageModels));
        assert.isNotEmpty(project.getSourceFileOrThrow("src/pages/ab-ab/ac-ac/index.ts").getText());
        cwdStub.restore();
	});
});
