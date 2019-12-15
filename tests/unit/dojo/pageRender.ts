import { renderPage } from '../../../src/dojo/pageRender';
import { CodeBlockWriter } from 'ts-morph';
import { AttachedWidget } from '../../../src/interfaces';

const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

describe('dojo/pageRender', () => {
	let writer: CodeBlockWriter;

	beforeEach(() => {
		writer = new CodeBlockWriter();
	});

	it('renderPage: no widgets', () => {
		const widgets: AttachedWidget[] = [];
		renderPage(writer, widgets);
		assert.equal(writer.toString(), '');
	});

	it('renderPage: has a root widget and property has no value', () => {
		const widgets: AttachedWidget[] = [
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
						isExpr: false
					}
				]
			}
		];
		renderPage(writer, widgets);
		const code = `w(WidgetA, {key: "1"}, [])`;
		assert.equal(writer.toString(), code);
	});

	it('renderPage: has a root widget and property has default value', () => {
		const widgets: AttachedWidget[] = [
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
						isExpr: false
					}
				]
			}
		];
		renderPage(writer, widgets);
		const code = `w(WidgetA, {key: "1", propA: "a"}, [])`;
		assert.equal(writer.toString(), code);
	});

	it('renderPage: has a root widget and property has string value', () => {
		const widgets: AttachedWidget[] = [
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
		];
		renderPage(writer, widgets);
		const code = `w(WidgetA, {key: "1", propA: "b"}, [])`;
		assert.equal(writer.toString(), code);
	});

	it('renderPage: has a root widget and property has boolean value', () => {
		const widgets: AttachedWidget[] = [
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
						valueType: 'boolean',
						defaultValue: 'a',
						value: 'false',
						isExpr: false
					}
				]
			}
		];
		renderPage(writer, widgets);
		const code = `w(WidgetA, {key: "1", propA: false}, [])`;
		assert.equal(writer.toString(), code);
	});

	it('renderPage: has a root widget and property has function value', () => {
		const widgets: AttachedWidget[] = [
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
						valueType: 'function',
						value: '()=>{}',
						isExpr: false
					}
				]
			}
		];
		renderPage(writer, widgets);
		const code = `w(WidgetA, {key: "1", propA: ()=>{}}, [])`;
		assert.equal(writer.toString(), code);
	});

	it('renderPage: has two widgets', () => {
		const widgets: AttachedWidget[] = [
			{
				id: '1',
				parentId: '-1',
				apiRepoId: 1,
				widgetName: 'WidgetA',
				canHasChildren: true,
				properties: []
			},
			{
				id: '2',
				parentId: '1',
				apiRepoId: 1,
				widgetName: 'WidgetB',
				canHasChildren: false,
				properties: []
			}
		];
		renderPage(writer, widgets);
		const code = `w(WidgetA, {key: "1"}, [w(WidgetB, {key: "2"})])`;
		assert.equal(writer.toString(), code);
	});
});
