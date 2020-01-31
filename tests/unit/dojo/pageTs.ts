import { create } from "../../../src/dojo/pageTs";
import { InMemoryFileSystemHost } from '@ts-morph/common';
import { Project } from 'ts-morph';
import { PageModel } from '../../../src/interfaces';
import {stub, SinonStub} from 'sinon';
import * as path from 'path';
import * as logger from '../../../src/logger';

const { describe, it, beforeEach, afterEach } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

let cwdStub: SinonStub<[], string>;
let loggerStub: SinonStub<[string], void>;
let project: Project;

describe('dojo/pageTs', () => {

    beforeEach(() => {
        cwdStub = stub(process, "cwd").returns("");
        loggerStub = stub(logger, "error");

        const fileSystem = new InMemoryFileSystemHost();
        fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "ES2015" } }`);
        project = new Project({tsConfigFilePath: "tsconfig.json", fileSystem});
    });

    afterEach(() => {
        cwdStub.restore();
        loggerStub.restore();
    });

    it('create: page source file exists', () => {
        project.createSourceFile("src/pages/main/index.ts", "");
        const pageModels: PageModel[] = [{
            pageInfo: {
                id: 1,
                key: 'main',
                groupPath: ''
            },
            widgets: [],
            data: []
        }];
        assert.isFalse(create(project, [], pageModels));
        assert.isTrue(loggerStub.calledOnceWith(`创建源文件 ${path.join("src/pages/main/index.ts")} 失败，文件已存在！`))
    });

	it('create: default', () => {
		assert.isTrue(create(project, [], []));
    });
    
    it('create: src/pages/main/index.ts', () => {
        const pageModels: PageModel[] = [{
            pageInfo: {
                id: 1,
                key: 'main',
                groupPath: ''
            },
            widgets: [],
            data: []
        }];
        assert.isTrue(create(project, [], pageModels));
        assert.isNotEmpty(project.getSourceFileOrThrow("src/pages/main/index.ts").getText());
    });
    
    it('create: src/pages/ab-ab/ac-ac/index.ts', () => {
        const pageModels: PageModel[] = [{
            pageInfo: {
                id: 1,
                key: 'AcAc',
                groupPath: 'AbAb'
            },
            widgets: [],
            data: []
        }];
        assert.isTrue(create(project, [], pageModels));
        assert.isNotEmpty(project.getSourceFileOrThrow("src/pages/ab-ab/ac-ac/index.ts").getText());
    });
    
    it('create: src/pages/ab-ab/ac-ac/ad-ad/index.ts', () => {
        const pageModels: PageModel[] = [{
            pageInfo: {
                id: 1,
                key: 'AdAd',
                groupPath: 'AbAb/AcAc'
            },
            widgets: [],
            data: []
        }];
        assert.isTrue(create(project, [], pageModels));
        assert.isNotEmpty(project.getSourceFileOrThrow("src/pages/ab-ab/ac-ac/ad-ad/index.ts").getText());
	});
});
