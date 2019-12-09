import { getPageImports } from "../../../src/dojo/appTs";
import { PageInfo } from '../../../src/interfaces';

const { describe, it } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

describe('dojo/appTs', () => {
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
