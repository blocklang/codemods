import { getPagePath, getPageGroupPathes, getStateInterfacePropertyName, getStateInterfacePropertyType, getModuleSpecifier } from "../../../src/dojo/pageUtil";
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

    it('getPagePath: src/pages/ab-ab/ac-ac/ad-ad', () => {
        const pageInfo: PageInfo = {
            id: 1,
            key: "AdAd",
            groupPath: "AbAb/AcAc"
        };
        const pagePath = getPagePath(pageInfo);
        assert.equal(pagePath, path.join("src/pages/ab-ab/ac-ac/ad-ad/index.ts"));
    });

    it("getPageGroupPathes: empty string", () => {
        assert.isEmpty(getPageGroupPathes(""));
    });

    it("getPageGroupPathes: one path", () => {
        assert.equal(getPageGroupPathes("a").length, 1);
    });

    it("getStateInterfacePropertyName: camelCase and groupPath is blank", () => {
        const pageInfo: PageInfo = {
            id: 1,
            key: "Main",
            groupPath: ""
        };
        assert.equal(getStateInterfacePropertyName(pageInfo), "main");
    });

    it("getStateInterfacePropertyName: camelCase and groupPath is not blank and only has one letter", () => {
        const pageInfo: PageInfo = {
            id: 1,
            key: "main",
            groupPath: "a/b"
        };
        assert.equal(getStateInterfacePropertyName(pageInfo), "aBMain");
    });

    it("getStateInterfacePropertyName: camelCase and groupPath is not blank", () => {
        const pageInfo: PageInfo = {
            id: 1,
            key: "main",
            groupPath: "ab/ac"
        };
        assert.equal(getStateInterfacePropertyName(pageInfo), "abAcMain");
    });

    it("getStateInterfacePropertyType: groupPath is blank", () => {
        const pageInfo: PageInfo = {
            id: 1,
            key: "main",
            groupPath: ""
        };
        assert.equal(getStateInterfacePropertyType(pageInfo), "Main");
    });

    it("getStateInterfacePropertyType: groupPath is not blank", () => {
        const pageInfo: PageInfo = {
            id: 1,
            key: "main",
            groupPath: "a/b"
        };
        assert.equal(getStateInterfacePropertyType(pageInfo), "ABMain");
    });

    // 从当前目录往上找
    it("getModuleSpecifier: groupPath is blank", () => {
        assert.equal(getModuleSpecifier("util", ""), "./util");
    });

    // 从当前目录往上找
    it("getModuleSpecifier: groupPath is not blank", () => {
        assert.equal(getModuleSpecifier("util", "a/b"), "../../util");
    });

    it("getModuleSpecifier: root is not blank", () => {
        assert.equal(getModuleSpecifier("util", "a/b", ".."), "../../../util");
    });

});
