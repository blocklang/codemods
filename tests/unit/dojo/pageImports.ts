import { getWidgetImports } from '../../../src/dojo/pageImports';
import { Dependency, AttachedWidget } from '../../../src/interfaces';

const { describe, it } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

describe('dojo/pageImports', () => {
	it('getWidgetImports: no widgets', () => {
		const dependencies: Dependency[] = [];
		const widgets: AttachedWidget[] = [];
		const imports = getWidgetImports(dependencies, widgets);
		assert.isEmpty(imports);
	});

	it('getWidgetImports: distinct widgets', () => {
		const dependencies = [
			{
				name: 'repo1',
				version: '0.0.1',
				apiRepoId: 1
			}
		];
		const widgets = [
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
			},
			{
				id: '3',
				parentId: '1',
				apiRepoId: 1,
				widgetName: 'WidgetB',
				canHasChildren: false,
				properties: []
			}
		];
		const imports = getWidgetImports(dependencies, widgets);
		assert.equal(imports.length, 2);

		// 默认不设置 build 部件的存放路径，而是根据部件名推导
		// 如果部件名为 TextInput，则部件的模块标识为 {repoName}/text-input
		assert.equal(imports[0].defaultImport, 'WidgetA');
		assert.equal(imports[0].moduleSpecifier, 'repo1/widget-a');

		assert.equal(imports[1].defaultImport, 'WidgetB');
		assert.equal(imports[1].moduleSpecifier, 'repo1/widget-b');
	});
});
