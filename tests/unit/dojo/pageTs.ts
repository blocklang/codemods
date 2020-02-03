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
    
    it('create: source in src/pages/main/index.ts, not define any widget', () => {
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
        const actual = project.getSourceFileOrThrow("src/pages/main/index.ts").getText();
        const expected = `import { v, create } from '@dojo/framework/core/vdom';

export interface MainProperties { }

const factory = create().properties<MainProperties>();

export default factory(function Main({ properties }) {
    const { } = properties();
    return v('div', {}, [

    ]);
});
`
        assert.equal(actual, expected);
    });

    it('create: source in src/pages/main/index.ts, define one widget', () => {
        const pageModels: PageModel[] = [{
            pageInfo: {
                id: 1,
                key: 'main',
                groupPath: ''
            },
            widgets: [{
				id: '1',
				parentId: '-1',
				apiRepoId: 1,
				widgetName: 'WidgetA',
				canHasChildren: true,
				properties: [
					{
						id: '1',
						name: 'propA',
						valueType: 'function',
						value: '()=>{}',
						isExpr: false
					}
				]
			}],
            data: []
        }];
        assert.isTrue(create(project, [], pageModels));
        const actual = project.getSourceFileOrThrow("src/pages/main/index.ts").getText();
        const expected = `import { v, w, create } from '@dojo/framework/core/vdom';

export interface MainProperties { }

const factory = create().properties<MainProperties>();

export default factory(function Main({ properties }) {
    const { } = properties();
    return v('div', {}, [
        w(WidgetA, { key: "1", propA: () => { } }, [])
    ]);
});
`
        assert.equal(actual, expected);
    });

    it('create: source in src/pages/main/index.ts, define one widget and two data item', () => {
        const pageModels: PageModel[] = [{
            pageInfo: {
                id: 1,
                key: 'main',
                groupPath: ''
            },
            widgets: [{
				id: '1',
				parentId: '-1',
				apiRepoId: 1,
				widgetName: 'WidgetA',
				canHasChildren: true,
				properties: [
					{
						id: '1',
						name: 'propA',
						valueType: 'string',
						value: '2',
						isExpr: true
					}
				]
			}],
            data: [{
                id: "1",
                parentId: "-1",
                name: "$",
                type: "Object"
            }, {
                id: "2",
                parentId: "1",
                name: "str",
                type: "String",
                value: "a"
            }]
        }];
        assert.isTrue(create(project, [], pageModels));
        const actual = project.getSourceFileOrThrow("src/pages/main/index.ts").getText();
        const expected = `import { v, w, create } from '@dojo/framework/core/vdom';
import store from "../store";
import { initDataProcess } from "../processes/mainProcesses";

export interface MainProperties { }

const factory = create({ store }).properties<MainProperties>();

export default factory(function Main({ properties, middleware: { store } }) {
    const { } = properties();
    const { get, path, executor } = store;

    const pageData = get(path("main"));
    if (!pageData) {
        executor(initDataProcess)({});
    }
    const str = get(path("main", "str"));

    return v('div', {}, [
        w(WidgetA, { key: "1", propA: str }, [])
    ]);
});
`
        assert.equal(actual, expected);
    });

    it('create: source in src/pages/main/index.ts, define one widget and two data item and groupPath is not blank', () => {
        const pageModels: PageModel[] = [{
            pageInfo: {
                id: 1,
                key: 'main',
                groupPath: 'a/b'
            },
            widgets: [{
				id: '1',
				parentId: '-1',
				apiRepoId: 1,
				widgetName: 'WidgetA',
				canHasChildren: true,
				properties: [
					{
						id: '1',
						name: 'propA',
						valueType: 'string',
						value: '2',
						isExpr: true
					}
				]
			}],
            data: [{
                id: "1",
                parentId: "-1",
                name: "$",
                type: "Object"
            }, {
                id: "2",
                parentId: "1",
                name: "str",
                type: "String",
                value: "a"
            }]
        }];
        assert.isTrue(create(project, [], pageModels));
        const actual = project.getSourceFileOrThrow("src/pages/a/b/main/index.ts").getText();
        const expected = `import { v, w, create } from '@dojo/framework/core/vdom';
import store from "../../../store";
import { initDataProcess } from "../../../processes/mainProcesses";

export interface MainProperties { }

const factory = create({ store }).properties<MainProperties>();

export default factory(function Main({ properties, middleware: { store } }) {
    const { } = properties();
    const { get, path, executor } = store;

    const pageData = get(path("aBMain"));
    if (!pageData) {
        executor(initDataProcess)({});
    }
    const str = get(path("aBMain", "str"));

    return v('div', {}, [
        w(WidgetA, { key: "1", propA: str }, [])
    ]);
});
`
        assert.equal(actual, expected);
    });
});
