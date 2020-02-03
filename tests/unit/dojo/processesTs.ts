import { SinonStub, stub } from "sinon";
import { Project, InMemoryFileSystemHost } from 'ts-morph';
import * as logger from '../../../src/logger';
import { create } from '../../../src/dojo/processesTs';

const { describe, it, beforeEach, afterEach } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

describe('dojo/processesTs', () => {

    let project: Project;
    let loggerErrorStub: SinonStub<[string], void>;
    let loggerInfoStub: SinonStub<[string], void>;
    let cwdStub: SinonStub<[], string>;

    beforeEach(() => {
        const fileSystem = new InMemoryFileSystemHost();
        fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "ES2015" } }`);
        project = new Project({tsConfigFilePath: "tsconfig.json", fileSystem});
   
        loggerErrorStub = stub(logger, "error");
        loggerInfoStub = stub(logger, "info");
        cwdStub = stub(process, "cwd").returns("");
    });

    afterEach(() => {
        loggerErrorStub.restore();
        loggerInfoStub.restore();
        cwdStub.restore();
    });

    it('create: pageModels is empty', () => {
        assert.isTrue(create(project, []));
        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("共发现 0 个页面。"));
    });

    it('create: pageModels has one item, but data is empty', () => {
        assert.isTrue(create(project, [{
            pageInfo: {
                id: 1,
                key: 'main',
                groupPath: ''
            },
            widgets: [],
            data: []
        }]));

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    it('create: create process file that groupPath is blank', () => {
        assert.isTrue(create(project, [{
            pageInfo: {
                id: 1,
                key: 'main',
                groupPath: ''
            },
            widgets: [],
            data: [{
                id: "1",
                parentId: "-1",
                name: "$",
                type: "Object"
            }, {
                id: "2",
                parentId: "1",
                name: "str",
                type: "String"
            }]
        }]));
        assert.exists(project.getSourceFile("src/processes/mainProcesses.ts"));
    });

    it('create: create process file that groupPath is not blank', () => {
        assert.isTrue(create(project, [{
            pageInfo: {
                id: 1,
                key: 'main',
                groupPath: 'a/b'
            },
            widgets: [],
            data: [{
                id: "1",
                parentId: "-1",
                name: "$",
                type: "Object"
            }, {
                id: "2",
                parentId: "1",
                name: "str",
                type: "String"
            }]
        }]));
        assert.exists(project.getSourceFile("src/processes/a/b/mainProcesses.ts"));
    });

    it('create: page data has a string property', () => {
        assert.isTrue(create(project, [{
            pageInfo: {
                id: 1,
                key: 'main',
                groupPath: ''
            },
            widgets: [],
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
        }]));

        const processesSource = project.getSourceFileOrThrow("src/processes/mainProcesses.ts").getFullText();
        const expectedSource = 
            `import { commandFactory } from "./utils";\n` +
            `import { add } from "@dojo/framework/stores/state/operations";\n` +
            `import { createProcess } from "@dojo/framework/stores/process";\n\n` +
            `const initDataCommand = commandFactory(({ path }) => {\n` +
            `    const pageData = {\n` +
            `        str: "a"\n` +
            `    };\n` +
            `    return [add(path("main"), pageData)];\n` + 
            `});\n` +
            `export const initDataProcess = createProcess("init-data-process", [initDataCommand]);\n`;

        assert.equal(processesSource, expectedSource);
    });

    it('create: page data has a number property', () => {
        assert.isTrue(create(project, [{
            pageInfo: {
                id: 1,
                key: 'page1',
                groupPath: ''
            },
            widgets: [],
            data: [{
                id: "1",
                parentId: "-1",
                name: "$",
                type: "Object"
            }, {
                id: "2",
                parentId: "1",
                name: "num",
                type: "Number",
                value: "1"
            }]
        }]));

        const processesSource = project.getSourceFileOrThrow("src/processes/page1Processes.ts").getFullText();
        const expectedSource = 
            `import { commandFactory } from "./utils";\n` +
            `import { add } from "@dojo/framework/stores/state/operations";\n` +
            `import { createProcess } from "@dojo/framework/stores/process";\n\n` +
            `const initDataCommand = commandFactory(({ path }) => {\n` +
            `    const pageData = {\n` +
            `        num: 1\n` +
            `    };\n` +
            `    return [add(path("page1"), pageData)];\n` + 
            `});\n` +
            `export const initDataProcess = createProcess("init-data-process", [initDataCommand]);\n`;

        assert.equal(processesSource, expectedSource);
    });

    it('create: groupPath is not blank', () => {
        assert.isTrue(create(project, [{
            pageInfo: {
                id: 1,
                key: 'page1',
                groupPath: 'a/b'
            },
            widgets: [],
            data: [{
                id: "1",
                parentId: "-1",
                name: "$",
                type: "Object"
            }, {
                id: "2",
                parentId: "1",
                name: "num",
                type: "Number",
                value: "1"
            }]
        }]));

        const processesSource = project.getSourceFileOrThrow("src/processes/a/b/page1Processes.ts").getFullText();
        const expectedSource = 
            `import { commandFactory } from "../../utils";\n` +
            `import { add } from "@dojo/framework/stores/state/operations";\n` +
            `import { createProcess } from "@dojo/framework/stores/process";\n\n` +
            `const initDataCommand = commandFactory(({ path }) => {\n` +
            `    const pageData = {\n` +
            `        num: 1\n` +
            `    };\n` +
            `    return [add(path("page1"), pageData)];\n` + 
            `});\n` +
            `export const initDataProcess = createProcess("init-data-process", [initDataCommand]);\n`;

        assert.equal(processesSource, expectedSource);
    });
});
