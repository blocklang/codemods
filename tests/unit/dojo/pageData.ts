import { CodeBlockWriter } from "ts-morph";
import { declareVariables, initPageData } from '../../../src/dojo/pageData';
import { PageModel } from '../../../src/interfaces';

const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');


describe('dojo/pageData', () => {

    let writer: CodeBlockWriter;

    beforeEach(() => {
        writer = new CodeBlockWriter();
    });

    it('initPageData: groupPath is blank', () => {
        const pageInfo = {
            id: 1,
            key: "Main",
            groupPath: ""
        };
        initPageData(writer, pageInfo);
        const expected = `const {get, path, executor} = store;\n\n` +
        `const pageData = get(path("main"));\n` + 
        `if(!pageData) {\n` + 
        `    executor(initDataProcess)({});\n` + 
        `}\n`;
        assert.equal(writer.toString(), expected);
    });

    it('initPageData: groupPath is not blank', () => {
        const pageInfo = {
            id: 1,
            key: "Main",
            groupPath: "a/b"
        };
        initPageData(writer, pageInfo);
        const expected = `const {get, path, executor} = store;\n\n` +
        `const pageData = get(path("aBMain"));\n` + 
        `if(!pageData) {\n` + 
        `    executor(initDataProcess)({});\n` + 
        `}\n`;
        assert.equal(writer.toString(), expected);
    });

    // 没有定义数据
    it('declareVariables: no data', () => {
        const pageModel: PageModel = {
            pageInfo: {
                id: 1,
                key: "main",
                groupPath: ""
            },
            widgets: [
                {
                    id: '1',
                    parentId: '-1',
                    apiRepoId: 1,
                    widgetName: 'WidgetA',
                    canHasChildren: true,
                    properties: [
                        {
                            id: '1',
                            name: 'propA',
                            valueType: 'string',
                            defaultValue: 'a',
                            value: 'b',
                            isExpr: false
                        }
                    ]
                }
            ],
            data: []
        }
        
        declareVariables(writer, pageModel);
        assert.equal(writer.toString(), '');
    });

    // 没有定义部件
    it('declareVariables: no widgets', () => {
        const pageModel: PageModel = {
            pageInfo: {
                id: 1,
                key: "main",
                groupPath: ""
            },
            widgets: [],
            data:[{
                id: "1",
                parentId: "-1",
                name: "$",
                type: "Object"
            }]
        }
        
        declareVariables(writer,pageModel);
        assert.equal(writer.toString(), '');
    });

    // 部件中未引用数据
    // 即使定义了数据，如果没有部件没有引用，则无需定义变量。
    it('declareVariables: widget not use data', () => {
        const pageModel: PageModel = {
            pageInfo: {
                id: 1,
                key: "main",
                groupPath: ""
            },
            widgets: [{
                id: '1',
                parentId: '-1',
                apiRepoId: 1,
                widgetName: 'WidgetA',
                canHasChildren: true,
                properties: [
                    {
                        id: '1',
                        name: 'propA',
                        valueType: 'string',
                        defaultValue: 'a',
                        value: 'b',
                        isExpr: false
                    }
                ]
            }],
            data:[{
                id: "1",
                parentId: "-1",
                name: "$",
                type: "Object"
            }]
        };
        
        declareVariables(writer,pageModel);
        assert.equal(writer.toString(), '');
    });

    it('declareVariables: widget use one string value', () => {
        const pageModel: PageModel = {
            pageInfo: {
                id: 1,
                key: "main",
                groupPath: ""
            },
            widgets: [{
                id: '1',
                parentId: '-1',
                apiRepoId: 1,
                widgetName: 'WidgetA',
                canHasChildren: true,
                properties: [
                    {
                        id: '1',
                        name: 'dataId', // dataId 属性是一个关键字，会特殊处理
                        valueType: 'string',
                        value: '2',
                        isExpr: true
                    }
                ]
            }],
            data: [{
                id: "1",
                parentId: "-1",
                name: "$",
                type: "Object"
            },{
                id: "2",
                parentId: "1",
                name: "str",
                type: "String",
                value: "1"
            }]
        }
        
        declareVariables(writer, pageModel);

        const expectedSource = `const str = get(path("main", "str"));\n\n`;
        assert.equal(writer.toString(), expectedSource);
    });

    it('declareVariables: widget use one number value', () => {
        const pageModel: PageModel = {
            pageInfo: {
                id: 1,
                key: "main",
                groupPath: ""
            },
            widgets: [{
                id: '1',
                parentId: '-1',
                apiRepoId: 1,
                widgetName: 'WidgetA',
                canHasChildren: true,
                properties: [
                    {
                        id: '1',
                        name: 'dataId', // dataId 属性是一个关键字，会特殊处理
                        valueType: 'string',
                        value: '2',
                        isExpr: true
                    }
                ]
            }],
            data: [{
                id: "1",
                parentId: "-1",
                name: "$",
                type: "Object"
            },{
                id: "2",
                parentId: "1",
                name: "num",
                type: "Number",
                value: "1"
            }]
        }
        
        declareVariables(writer,pageModel);

        const expectedSource = `const num = get(path("main", "num"));\n\n`;
        assert.equal(writer.toString(), expectedSource);
    });

    it('declareVariables: remove duplicate variable', () => {
        const pageModel: PageModel  = {
            pageInfo: {
                id: 1,
                key: "main",
                groupPath: ""
            },
            widgets: [{
                id: '1',
                parentId: '-1',
                apiRepoId: 1,
                widgetName: 'WidgetA',
                canHasChildren: true,
                properties: [
                    {
                        id: '1',
                        name: 'dataId', // dataId 属性是一个关键字，会特殊处理
                        valueType: 'string',
                        value: '2',
                        isExpr: true
                    },{
                        id: '2',
                        name: 'a', // dataId 属性是一个关键字，会特殊处理
                        valueType: 'string',
                        value: '2', // 两个属性的值都为 2
                        isExpr: true
                    }
                ]
            }],
            data: [{
                id: "1",
                parentId: "-1",
                name: "$",
                type: "Object"
            },{
                id: "2",
                parentId: "1",
                name: "num",
                type: "Number",
                value: "1"
            }]
        };
        
        declareVariables(writer, pageModel);

        const expectedSource = `const num = get(path("main", "num"));\n\n`;
        assert.equal(writer.toString(), expectedSource);
    });

});
