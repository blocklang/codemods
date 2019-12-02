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
		const widgets = [];
		renderPage(writer, widgets);
		assert.equal(writer.toString(), '');
	});

	it('renderPage: has a root widget', () => {
		const widgets: AttachedWidget[] = [
			{
				id: '1',
				parentId: '-1',
				widgetName: 'WidgetA',
				canHasChildren: true,
				properties: [
					{
						id: '1',
						name: 'propA',
						valueType: 'string',
						value: 'a',
						isExpr: false
					}
				]
			}
		];
		renderPage(writer, widgets);
		const code = `w(WidgetA, {key: "1", propA: "a"}, [])`;
		assert.equal(writer.toString(), code);
	});

	it('renderPage: has two widgets', () => {
		const widgets: AttachedWidget[] = [
			{
				id: '1',
				parentId: '-1',
				widgetName: 'WidgetA',
				canHasChildren: true,
				properties: []
			},
			{
				id: '2',
				parentId: '1',
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
