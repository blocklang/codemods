import { Project, InMemoryFileSystemHost } from "ts-morph";
import {stub, SinonStub } from 'sinon';
import * as logger from '../../../src/logger';
import { update } from '../../../src/dojo/interfacesDTs';

const { describe, it, beforeEach, afterEach } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

let project: Project;
let loggerErrorStub: SinonStub<[string], void>;
let loggerInfoStub: SinonStub<[string], void>;
let cwdStub: SinonStub<[], string>;

describe('dojo/interfaceDTs', () => {
    
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

    it('update: src/interfaces.d.ts not found', () => {
        assert.isFalse(update(project, []));
        assert.isTrue(loggerErrorStub.calledOnceWith("在模板项目中没有找到 src/interfaces.d.ts 文件"));
    });

    it('update: not define State interface in src/interfaces.d.ts', () => {
        project.createSourceFile("src/interfaces.d.ts");

        assert.isFalse(update(project, []));
        const expectedSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(expectedSource, "");

        assert.isTrue(loggerErrorStub.calledOnceWith("src/interfaces.d.ts 文件中未定义 State 接口"));
    });

    it('update: pageModels is empty', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, []));
        const expectedSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(expectedSource, "export interface State { }\n");

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    it('update: pageModels has one item, but data is empty', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
            pageInfo: {
                id: 1,
                key: 'main',
                groupPath: ''
            },
            widgets: [],
            data: []
        }]));
        const expectedSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(expectedSource, "export interface State { }\n");

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    // 如果只有一个根节点，则不生成 interface
    it('update: pageModels has one item, but data only has root', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
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
            }]
        }]));
        assert.isUndefined(project.getSourceFile("src/typing/main.d.ts"));

        const expectedSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(expectedSource, "export interface State { }\n");

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    it('update: has one string property and groupPath is blank', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
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

        const mainInterfaceSource = project.getSourceFileOrThrow("src/typing/main.d.ts").getFullText();
        assert.equal(mainInterfaceSource, `export interface Main {\n    str: string;\n}\n`);

        const stateInterfaceSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(stateInterfaceSource, `import { Main } from "./typing/main";\n\nexport interface State {\n    main: Main;\n}\n`);

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    it('update: has one string property and groupPath is not blank', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
            pageInfo: {
                id: 1,
                key: 'main',
                groupPath: 'a'
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

        const mainInterfaceSource = project.getSourceFileOrThrow("src/typing/a/main.d.ts").getFullText();
        assert.equal(mainInterfaceSource, `export interface Main {\n    str: string;\n}\n`);

        const stateInterfaceSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(stateInterfaceSource, `import { Main } from "./typing/a/main";\n\nexport interface State {\n    main: Main;\n}\n`);

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    it('update: has one string property and groupPath is not blank and has two level', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
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

        const mainInterfaceSource = project.getSourceFileOrThrow("src/typing/a/b/main.d.ts").getFullText();
        assert.equal(mainInterfaceSource, `export interface Main {\n    str: string;\n}\n`);

        const stateInterfaceSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(stateInterfaceSource, `import { Main } from "./typing/a/b/main";\n\nexport interface State {\n    main: Main;\n}\n`);

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    it('update: has one number property', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
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
                name: "num",
                type: "Number"
            }]
        }]));

        const mainInterfaceSource = project.getSourceFileOrThrow("src/typing/main.d.ts").getFullText();
        assert.equal(mainInterfaceSource, `export interface Main {\n    num: number;\n}\n`);

        const stateInterfaceSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(stateInterfaceSource, `import { Main } from "./typing/main";\n\nexport interface State {\n    main: Main;\n}\n`);
        
        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    it('update: has one boolean property', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
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
                name: "foo",
                type: "Boolean"
            }]
        }]));

        const mainInterfaceSource = project.getSourceFileOrThrow("src/typing/main.d.ts").getFullText();
        assert.equal(mainInterfaceSource, `export interface Main {\n    foo: boolean;\n}\n`);

        const stateInterfaceSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(stateInterfaceSource, `import { Main } from "./typing/main";\n\nexport interface State {\n    main: Main;\n}\n`);
        
        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    it('update: has one date property', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
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
                name: "foo",
                type: "Date"
            }]
        }]));

        const mainInterfaceSource = project.getSourceFileOrThrow("src/typing/main.d.ts").getFullText();
        assert.equal(mainInterfaceSource, `export interface Main {\n    foo: string;\n}\n`);

        const stateInterfaceSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(stateInterfaceSource, `import { Main } from "./typing/main";\n\nexport interface State {\n    main: Main;\n}\n`);

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    it('update: has one Object property', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
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
                name: "obj",
                type: "Object"
            }, {
                id: "3",
                parentId: "2",
                name: "str",
                type: "String"
            }]
        }]));

        const mainInterfaceSource = project.getSourceFileOrThrow("src/typing/main.d.ts").getFullText();
        assert.equal(mainInterfaceSource, `export interface Obj {\n    str: string;\n}\n\nexport interface Main {\n    obj: Obj;\n}\n`);

        const stateInterfaceSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(stateInterfaceSource, `import { Main } from "./typing/main";\n\nexport interface State {\n    main: Main;\n}\n`);

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    // 目前的实现是根据变量名推导出接口名
    // 注意：同一层级下的变量不会同名（会校验）
    it('update: has two Object property that has the same interface name', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
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
                name: "obj",
                type: "Object"
            }, {
                id: "3",
                parentId: "2",
                name: "str",
                type: "String"
            }, {
                id: "4",
                parentId: "2",
                name: "obj",
                type: "Object"
            }, {
                id: "5",
                parentId: "4",
                name: "str",
                type: "String"
            }]
        }]));

        const mainInterfaceSource = project.getSourceFileOrThrow("src/typing/main.d.ts").getFullText();
        assert.equal(mainInterfaceSource, `export interface Obj1 {\n    str: string;\n}\n\nexport interface Obj {\n    str: string;\n    obj: Obj1;\n}\n\nexport interface Main {\n    obj: Obj;\n}\n`);

        const stateInterfaceSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(stateInterfaceSource, `import { Main } from "./typing/main";\n\nexport interface State {\n    main: Main;\n}\n`);

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });
    
    it('update: has one Array property, has no items', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
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
                name: "arr",
                type: "Array"
            }]
        }]));

        const mainInterfaceSource = project.getSourceFileOrThrow("src/typing/main.d.ts").getFullText();
        assert.equal(mainInterfaceSource, `export interface Main {\n    arr: any[];\n}\n`);

        const stateInterfaceSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(stateInterfaceSource, `import { Main } from "./typing/main";\n\nexport interface State {\n    main: Main;\n}\n`);

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    it('update: has one Array property, item has the same data type', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
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
                name: "arr",
                type: "Array"
            }, {
                id: "3",
                parentId: "2",
                name: "0",
                type: "String"
            }, {
                id: "4",
                parentId: "2",
                name: "1",
                type: "String"
            }]
        }]));

        const mainInterfaceSource = project.getSourceFileOrThrow("src/typing/main.d.ts").getFullText();
        assert.equal(mainInterfaceSource, `export interface Main {\n    arr: string[];\n}\n`);

        const stateInterfaceSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(stateInterfaceSource, `import { Main } from "./typing/main";\n\nexport interface State {\n    main: Main;\n}\n`);

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    it('update: has one Array property, item has different data type', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
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
                name: "arr",
                type: "Array"
            }, {
                id: "3",
                parentId: "2",
                name: "0",
                type: "String"
            }, {
                id: "4",
                parentId: "2",
                name: "1",
                type: "Number"
            }]
        }]));

        const mainInterfaceSource = project.getSourceFileOrThrow("src/typing/main.d.ts").getFullText();
        assert.equal(mainInterfaceSource, `export interface Main {\n    arr: (string | number)[];\n}\n`);

        const stateInterfaceSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(stateInterfaceSource, `import { Main } from "./typing/main";\n\nexport interface State {\n    main: Main;\n}\n`);

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

    it('update: has one Array property, item has different data type and one is Object', () => {
        project.createSourceFile("src/interfaces.d.ts", "export interface State {}");

        assert.isTrue(update(project, [{
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
                name: "arr",
                type: "Array"
            }, {
                id: "3",
                parentId: "2",
                name: "0",
                type: "String"
            }, {
                id: "4",
                parentId: "2",
                name: "obj",
                type: "Object"
            }, {
                id: "5",
                parentId: "4",
                name: "str",
                type: "String"
            }]
        }]));

        const mainInterfaceSource = project.getSourceFileOrThrow("src/typing/main.d.ts").getFullText();
        assert.equal(mainInterfaceSource, `export interface Obj {\n    str: string;\n}\n\nexport interface Main {\n    arr: (string | Obj)[];\n}\n`);

        const stateInterfaceSource = project.getSourceFileOrThrow("src/interfaces.d.ts").getFullText();
        assert.equal(stateInterfaceSource, `import { Main } from "./typing/main";\n\nexport interface State {\n    main: Main;\n}\n`);

        assert.isTrue(loggerInfoStub.getCalls()[1].calledWith("完成。"));
    });

});
