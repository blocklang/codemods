import {  Project } from "ts-morph";
import { InMemoryFileSystemHost } from '@ts-morph/common';
import { update } from '../../../src/dojo/routesTs';
import { PageInfo } from '../../../src/interfaces';
import {stub } from 'sinon';

const { describe, it, beforeEach  } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

let project: Project;

describe('dojo/routesTs', () => {

    beforeEach(() => {
        const fileSystem = new InMemoryFileSystemHost();
        fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "ES2015" } }`);
        fileSystem.writeFileSync("src/routes.ts", "export default [];");
        project = new Project({tsConfigFilePath: "tsconfig.json", fileSystem});
    });


	it('update: no page models', () => {
        const cwdStub = stub(process, "cwd").returns("");
        const pageInfos: PageInfo[] = [];
        assert.isTrue(update(project, pageInfos));

        const expectedSource = project.getSourceFileOrThrow("src/routes.ts").getFullText();
        assert.equal(expectedSource, "export default [];\n")
        cwdStub.restore();
    });
    
    it('update: is main page(key is main and place at root folder)', () => {
        const cwdStub = stub(process, "cwd").returns("");
        // 只有位于根目录下的 key 为 main 的文件才是入口文件
        const pageInfos: PageInfo[] = [{
            id: 1,
            key: "main",
            groupPath: ""
        }];
        assert.isTrue(update(project, pageInfos));

        const expectedSource = project.getSourceFileOrThrow("src/routes.ts").getFullText();
        assert.equal(expectedSource, `export default [{\n    path: "",\n    outlet: "main",\n    defaultRoute: true\n}];\n`)
        cwdStub.restore();
    });

    it('update: is not main page(key is main but not place at root folder)', () => {
        const cwdStub = stub(process, "cwd").returns("");
        // 只有位于根目录下的 key 为 main 的文件才是入口文件
        const pageInfos: PageInfo[] = [{
            id: 1,
            key: "main",
            groupPath: "group1"
        }];
        assert.isTrue(update(project, pageInfos));

        const expectedSource = project.getSourceFileOrThrow("src/routes.ts").getFullText();
        assert.equal(expectedSource, `export default [{\n    path: "group1/main",\n    outlet: "group1-main"\n}];\n`)
        cwdStub.restore();
    });

    it('update: a page is not main page and place at root folder', () => {
        const cwdStub = stub(process, "cwd").returns("");
        // 只有位于根目录下的 key 为 main 的文件才是入口文件
        const pageInfos: PageInfo[] = [{
            id: 1,
            key: "page1",
            groupPath: ""
        }];
        assert.isTrue(update(project, pageInfos));

        const expectedSource = project.getSourceFileOrThrow("src/routes.ts").getFullText();
        assert.equal(expectedSource, `export default [{\n    path: "page1",\n    outlet: "page1"\n}];\n`)
        cwdStub.restore();
    });

});
