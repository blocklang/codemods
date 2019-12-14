import { getPageImports, update } from "../../../src/dojo/appTs";
import { PageInfo } from '../../../src/interfaces';
import {stub} from 'sinon';
import { InMemoryFileSystemHost } from '@ts-morph/common';
import { Project } from 'ts-morph';
import * as logger from '../../../src/logger';

const { describe, it } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

describe('dojo/appTs', () => {

    it('update: src/App.ts not found', () => {
        const fileSystem = new InMemoryFileSystemHost();
        fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "ES2015" } }`);
        const project = new Project({tsConfigFilePath: "tsconfig.json", fileSystem});
    
        const cwdStub = stub(process, "cwd").returns("");
        const loggerStub = stub(logger, "error");

        assert.isFalse(update(project, []));
        assert.isTrue(loggerStub.calledOnceWith("在模板项目中没有找到 src/App.ts 文件"));

        cwdStub.restore();
        loggerStub.restore();
    });

    it('update: src/App.ts not contain default export', () => {
        const cwdStub = stub(process, "cwd").returns("");
        const loggerStub = stub(logger, "error");

        const fileSystem = new InMemoryFileSystemHost();
        fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "ES2015" } }`);
        fileSystem.writeFileSync("src/App.ts", "");
        const project = new Project({tsConfigFilePath: "tsconfig.json", fileSystem});

        assert.isFalse(update(project, []));
        assert.isTrue(loggerStub.calledOnceWith("在 src/App.ts 文件中没有找到默认的导出语句。"));

        cwdStub.restore();
        loggerStub.restore();
    });

    it('update: src/App.ts no argument in default export call', () => {
        const cwdStub = stub(process, "cwd").returns("");
        const loggerStub = stub(logger, "error");

        const fileSystem = new InMemoryFileSystemHost();
        fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "ES2015" } }`);
        fileSystem.writeFileSync("src/App.ts", "export default factory();");
        const project = new Project({tsConfigFilePath: "tsconfig.json", fileSystem});

        assert.isFalse(update(project, []));
        assert.isTrue(loggerStub.calledOnceWith("在 src/App.ts 的 factory 函数中有且只能有一个参数，但现在有 0 个参数。"));

        cwdStub.restore();
        loggerStub.restore();
    });

    it('update: src/App.ts no function body in default export call', () => {
        const cwdStub = stub(process, "cwd").returns("");
        const loggerStub = stub(logger, "error");

        const fileSystem = new InMemoryFileSystemHost();
        fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "ES2015" } }`);
        fileSystem.writeFileSync("src/App.ts", "export default factory('a');");
        const project = new Project({tsConfigFilePath: "tsconfig.json", fileSystem});

        assert.isFalse(update(project, []));
        assert.isTrue(loggerStub.calledOnceWith("should be 'export default factory(function App(){});'"));

        cwdStub.restore();
        loggerStub.restore();
    });

	it('getPageImports: no pages', () => {
        const pageInfos: PageInfo[] = [];
		assert.isEmpty(getPageImports(pageInfos));
    });
    
    it('getPageImports: has one page at root folder', () => {
        const pageInfos: PageInfo[] = [{
            id: 1,
            key: "pageA",
            groupPath: ""
        }];
        assert.equal(getPageImports(pageInfos).length, 1);
        const pageInfo = getPageImports(pageInfos)[0];
        assert.equal(pageInfo.defaultImport, "PageA");
        assert.equal(pageInfo.moduleSpecifier, "./pages/page-a");
    });

    it('getPageImports: has one page at one level sub folder', () => {
        const pageInfos: PageInfo[] = [{
            id: 1,
            key: "pageA",
            groupPath: "groupA"
        }];
        assert.equal(getPageImports(pageInfos).length, 1);
        const pageInfo = getPageImports(pageInfos)[0];
        assert.equal(pageInfo.defaultImport, "GroupAPageA");
        assert.equal(pageInfo.moduleSpecifier, "./pages/group-a/page-a");
    });

    it('getPageImports: has one page at two level sub folder', () => {
        const pageInfos: PageInfo[] = [{
            id: 1,
            key: "pageA",
            groupPath: "groupA/groupB"
        }];
        assert.equal(getPageImports(pageInfos).length, 1);
        const pageInfo = getPageImports(pageInfos)[0];
        assert.equal(pageInfo.defaultImport, "GroupAGroupBPageA");
        assert.equal(pageInfo.moduleSpecifier, "./pages/group-a/group-b/page-a");
    });
});
