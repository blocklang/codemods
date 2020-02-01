import { getVariableNames } from "../../src/util";
import { PageDataItem } from '../../src/interfaces';

const { describe, it  } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

describe('util', () => {

    it('getVariableNames: pageData is empty', () => {
        const pageData: PageDataItem[] = [];
        assert.isEmpty(getVariableNames(pageData));
    });

    it('getVariableNames: root node name is $', () => {
        const pageData: PageDataItem[] = [{
            id: "1",
            parentId: "-1",
            name: "$",
            type: "Object"
        }];
        const names = getVariableNames(pageData);
        assert.equal(names.size, 1);
        assert.equal(names.get("1"), "$");
    });

    it('getVariableNames: has a string value', () => {
        const pageData: PageDataItem[] = [{
            id: "1",
            parentId: "-1",
            name: "$",
            type: "Object"
        },{
            id: "2",
            parentId: "1",
            name: "str",
            type: "String"
        }];
        const names = getVariableNames(pageData);
        assert.equal(names.size, 2);
        assert.equal(names.get("2"), "str");
    });

    it('getVariableNames: has a string value, camelCase', () => {
        const pageData: PageDataItem[] = [{
            id: "1",
            parentId: "-1",
            name: "$",
            type: "Object"
        },{
            id: "2",
            parentId: "1",
            name: "STR",
            type: "String"
        }];
        const names = getVariableNames(pageData);
        assert.equal(names.size, 2);
        assert.equal(names.get("2"), "str");
    });

    it('getVariableNames: has the same value in different tree level', () => {
        const pageData: PageDataItem[] = [{
            id: "1",
            parentId: "-1",
            name: "$",
            type: "Object"
        },{
            id: "2",
            parentId: "1",
            name: "str", // first time
            type: "String"
        }, {
            id: "3",
            parentId: "1",
            name: "obj",
            type: "Object"
        }, {
            id: "4",
            parentId: "3",
            name: "str", // second time
            type: "String"
        }];
        const names = getVariableNames(pageData);
        assert.equal(names.size, 4);
        assert.equal(names.get("2"), "str");
        assert.equal(names.get("4"), "str1");
    });

    it('getVariableNames: array item name', () => {
        const pageData: PageDataItem[] = [{
            id: "1",
            parentId: "-1",
            name: "$",
            type: "Object"
        },{
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
        }];
        const names = getVariableNames(pageData);
        assert.equal(names.size, 4);
        assert.equal(names.get("2"), "arr");
        assert.equal(names.get("3"), "arr0"); // 追加数组元素的索引
        assert.equal(names.get("4"), "arr1");
    });
});
