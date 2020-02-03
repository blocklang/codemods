import { Project, InMemoryFileSystemHost } from "ts-morph";
import { SinonStub, stub } from 'sinon';
import * as logger from '../../../src/logger';
import { update } from '../../../src/dojo/routeProcessesTs';
import { PageModel } from '../../../src/interfaces';

const { describe, it, beforeEach, afterEach } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');


describe('dojo/routeProcessesTs', () => {

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

    it('create: src/processes/routeProcesses.ts not found', () => {
        assert.isFalse(update(project, []));
        assert.isTrue(loggerErrorStub.calledOnceWith("在模板项目中没有找到 src/processes/routeProcesses.ts 文件"))
    });

    it('create: changeRouteCommand variable not define', () => {
        project.createSourceFile("src/processes/routeProcesses.ts");
        assert.isFalse(update(project, []));
        const expectedSource = project.getSourceFileOrThrow("src/processes/routeProcesses.ts").getFullText();
        assert.equal(expectedSource, "");

        assert.isTrue(loggerErrorStub.calledOnceWith("在 src/processes/routeProcesses.ts 文件中未定义 changeRouteCommand 命令"));
    });

    it('create: initializer is not call expression', () => {
        project.createSourceFile("src/processes/routeProcesses.ts", `const changeRouteCommand = "a";`);
        assert.isFalse(update(project, []));
        const expectedSource = project.getSourceFileOrThrow("src/processes/routeProcesses.ts").getFullText();
        assert.equal(expectedSource, `const changeRouteCommand = "a";`);

        assert.isTrue(loggerErrorStub.calledOnceWith("在 src/processes/routeProcesses.ts 文件中定义 changeRouteCommand 命令时未调用 commandFactory 函数"));
    });

    it('create: not call commandFactory, is a string value', () => {
        project.createSourceFile("src/processes/routeProcesses.ts", `const changeRouteCommand = "a";`);
        assert.isFalse(update(project, []));
        const expectedSource = project.getSourceFileOrThrow("src/processes/routeProcesses.ts").getFullText();
        assert.equal(expectedSource, `const changeRouteCommand = "a";`);

        assert.isTrue(loggerErrorStub.calledOnceWith("在 src/processes/routeProcesses.ts 文件中定义 changeRouteCommand 命令时未调用 commandFactory 函数"));
    });

    it('create: not call commandFactory, call expression name is not commandFactory', () => {
        const initSource = `import { createProcess } from '@dojo/framework/stores/process';
import { replace } from '@dojo/framework/stores/state/operations';
import { commandFactory } from './utils';
import { ChangeRoutePayload } from './interfaces';

const changeRouteCommand = commandFactory1();

export const changeRouteProcess = createProcess('change-route', [changeRouteCommand]);`;

        project.createSourceFile("src/processes/routeProcesses.ts", initSource);
        assert.isFalse(update(project, []));

        assert.isTrue(loggerErrorStub.calledOnceWith("在 src/processes/routeProcesses.ts 文件中定义 changeRouteCommand 命令时未调用 commandFactory 函数"));
    });

    it('create: commandFactory, must pass one param', () => {
        const initSource = `import { createProcess } from '@dojo/framework/stores/process';
import { replace } from '@dojo/framework/stores/state/operations';
import { commandFactory } from './utils';
import { ChangeRoutePayload } from './interfaces';

const changeRouteCommand = commandFactory<ChangeRoutePayload>();

export const changeRouteProcess = createProcess('change-route', [changeRouteCommand]);`;

        project.createSourceFile("src/processes/routeProcesses.ts", initSource);
        assert.isFalse(update(project, []));

        assert.isTrue(loggerErrorStub.calledOnceWith("commandFactory 函数中只能传入一个参数"));
    });

    it('create: commandFactory, first params must be function', () => {
        const initSource = `import { createProcess } from '@dojo/framework/stores/process';
import { replace } from '@dojo/framework/stores/state/operations';
import { commandFactory } from './utils';
import { ChangeRoutePayload } from './interfaces';

const changeRouteCommand = commandFactory<ChangeRoutePayload>("a");

export const changeRouteProcess = createProcess('change-route', [changeRouteCommand]);`;

        project.createSourceFile("src/processes/routeProcesses.ts", initSource);
        assert.isFalse(update(project, []));

        assert.isTrue(loggerErrorStub.calledOnceWith("commandFactory 的参数必须是箭头函数"));
    });

    it('create: commandFactory, first param must has return clause', () => {
        const initSource = `import { createProcess } from '@dojo/framework/stores/process';
import { replace } from '@dojo/framework/stores/state/operations';
import { commandFactory } from './utils';
import { ChangeRoutePayload } from './interfaces';

const changeRouteCommand = commandFactory<ChangeRoutePayload>(({ path }) => {
    
});

export const changeRouteProcess = createProcess('change-route', [changeRouteCommand]);`;

        project.createSourceFile("src/processes/routeProcesses.ts", initSource);
        assert.isFalse(update(project, []));

        assert.isTrue(loggerErrorStub.calledOnceWith("箭头函数中必须包含 return 语句"));
    });

    it('create: add unload data operator, groupPath is blank', () => {
        const initSource = `import { createProcess } from '@dojo/framework/stores/process';
import { replace } from '@dojo/framework/stores/state/operations';
import { commandFactory } from './utils';
import { ChangeRoutePayload } from './interfaces';

const changeRouteCommand = commandFactory<ChangeRoutePayload>(({ path }) => {
    return [];
});

export const changeRouteProcess = createProcess('change-route', [changeRouteCommand]);`;

        project.createSourceFile("src/processes/routeProcesses.ts", initSource);

        const pageModels: PageModel[] = [{
            pageInfo: {
                id: 1,
                key: "main",
                groupPath: ""
            },
            widgets: [],
            data: []
        }]
        assert.isTrue(update(project, pageModels));

        const expectedSource = `import { createProcess } from '@dojo/framework/stores/process';
import { replace } from '@dojo/framework/stores/state/operations';
import { commandFactory } from './utils';
import { ChangeRoutePayload } from './interfaces';

const changeRouteCommand = commandFactory<ChangeRoutePayload>(({ path }) => {
    return [replace(path('main'), undefined)];
});

export const changeRouteProcess = createProcess('change-route', [changeRouteCommand]);`;
        
        assert.equal(project.getSourceFile("src/processes/routeProcesses.ts")?.getFullText(), expectedSource);
    });

    it('create: add unload data operator, groupPath is not blank', () => {
        const initSource = `import { createProcess } from '@dojo/framework/stores/process';
import { replace } from '@dojo/framework/stores/state/operations';
import { commandFactory } from './utils';
import { ChangeRoutePayload } from './interfaces';

const changeRouteCommand = commandFactory<ChangeRoutePayload>(({ path }) => {
    return [];
});

export const changeRouteProcess = createProcess('change-route', [changeRouteCommand]);`;

        project.createSourceFile("src/processes/routeProcesses.ts", initSource);

        const pageModels: PageModel[] = [{
            pageInfo: {
                id: 1,
                key: "main",
                groupPath: "a/b"
            },
            widgets: [],
            data: []
        }]
        assert.isTrue(update(project, pageModels));

        const expectedSource = `import { createProcess } from '@dojo/framework/stores/process';
import { replace } from '@dojo/framework/stores/state/operations';
import { commandFactory } from './utils';
import { ChangeRoutePayload } from './interfaces';

const changeRouteCommand = commandFactory<ChangeRoutePayload>(({ path }) => {
    return [replace(path('aBMain'), undefined)];
});

export const changeRouteProcess = createProcess('change-route', [changeRouteCommand]);`;
        
        assert.equal(project.getSourceFile("src/processes/routeProcesses.ts")?.getFullText(), expectedSource);
    });

});
