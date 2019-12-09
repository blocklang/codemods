import { getPagePath } from "../../../src/dojo/pageUtil";
import { PageInfo } from '../../../src/interfaces';
import { stub } from 'sinon';
import * as path from 'path';

const { describe, it } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

describe('dojo/pageUtil', () => {
	it('getPagePath: src/pages/a', () => {
        const cwdStub = stub(process, "cwd").returns("");
        const pageInfo: PageInfo = {
            id: 1,
            key: "a",
            groupPath: ""
        };
        const pagePath = getPagePath(pageInfo);
        assert.equal(pagePath, path.join("src/pages/a/index.ts"));
        cwdStub.restore();
    });
    
    it('getPagePath: src/pages/ab', () => {
        const cwdStub = stub(process, "cwd").returns("");
        const pageInfo: PageInfo = {
            id: 1,
            key: "Ab",
            groupPath: ""
        };
        const pagePath = getPagePath(pageInfo);
        assert.equal(pagePath, path.join("src/pages/ab/index.ts"));
        cwdStub.restore();
    });

    it('getPagePath: src/pages/ab-ab', () => {
        const cwdStub = stub(process, "cwd").returns("");
        const pageInfo: PageInfo = {
            id: 1,
            key: "AbAb",
            groupPath: ""
        };
        const pagePath = getPagePath(pageInfo);
        assert.equal(pagePath, path.join("src/pages/ab-ab/index.ts"));
        cwdStub.restore();
    });

    it('getPagePath: src/pages/ab-ab/ab-ab', () => {
        const cwdStub = stub(process, "cwd").returns("");
        const pageInfo: PageInfo = {
            id: 1,
            key: "AbAb",
            groupPath: "AbAb"
        };
        const pagePath = getPagePath(pageInfo);
        assert.equal(pagePath, path.join("src/pages/ab-ab/ab-ab/index.ts"));
        cwdStub.restore();
    });

});
