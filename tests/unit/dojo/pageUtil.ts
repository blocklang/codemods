import { getPagePath, getPageGroupPathes } from "../../../src/dojo/pageUtil";
import { PageInfo } from '../../../src/interfaces';
import * as path from 'path';

const { describe, it } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

describe('dojo/pageUtil', () => {
	it('getPagePath: src/pages/a', () => {
        const pageInfo: PageInfo = {
            id: 1,
            key: "a",
            groupPath: ""
        };
        const pagePath = getPagePath(pageInfo);
        assert.equal(pagePath, path.join("src/pages/a/index.ts"));
    });
    
    it('getPagePath: src/pages/ab', () => {
        const pageInfo: PageInfo = {
            id: 1,
            key: "Ab",
            groupPath: ""
        };
        const pagePath = getPagePath(pageInfo);
        assert.equal(pagePath, path.join("src/pages/ab/index.ts"));
    });

    it('getPagePath: src/pages/ab-ab', () => {
        const pageInfo: PageInfo = {
            id: 1,
            key: "AbAb",
            groupPath: ""
        };
        const pagePath = getPagePath(pageInfo);
        assert.equal(pagePath, path.join("src/pages/ab-ab/index.ts"));
    });

    it('getPagePath: src/pages/ab-ab/ab-ab', () => {
        const pageInfo: PageInfo = {
            id: 1,
            key: "AbAb",
            groupPath: "AbAb"
        };
        const pagePath = getPagePath(pageInfo);
        assert.equal(pagePath, path.join("src/pages/ab-ab/ab-ab/index.ts"));
    });

    it("getPageGroupPathes: empty string", () => {
        assert.isEmpty(getPageGroupPathes(""));
    });

    it("getPageGroupPathes: one path", () => {
        assert.equal(getPageGroupPathes("a").length, 1);
    });

});
