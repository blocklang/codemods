import { CodeBlockWriter } from 'ts-morph';
import { AttachedWidget } from '../interfaces';
import { getChildrenIndex } from '../util';

let roWidgets: ReadonlyArray<AttachedWidget>;

export function renderPage(writer: CodeBlockWriter, widgets: AttachedWidget[] = []): void {
	if (widgets.length === 0) {
		return;
	}

	roWidgets = widgets;

	const rootWidget = widgets[0];
	renderWidget(writer, rootWidget, 0);
}

function renderWidget(writer: CodeBlockWriter, widget: AttachedWidget, index: number): void {
	writer
		.write('w(')
		.write(widget.widgetName)
		.write(', ')
		.write('{key: ')
		.quote()
		.write(widget.id)
		.quote();
	widget.properties.forEach((prop, index) => {
		writer.write(', ');
		writer.write(prop.name).write(': ');
		if (prop.valueType === 'string') {
			writer
				.quote()
				.write(prop.value)
				.quote();
		}
	});
	writer.write('}');
	if (widget.canHasChildren) {
		writer.write(', [');
		// 获取直属子部件
		const firstChildIndex = index + 1;
		renderChildWidgets(writer, widget.id, firstChildIndex);
		writer.write(']');
	}
	writer.write(')');
}

/**
 * @function renderChildWidgets
 *
 * 渲染子部件
 *
 * @param children          父部件直属子部件的索引集合
 */
function renderChildWidgets(writer: CodeBlockWriter, id: string, firstChildIndex: number): void {
	const children = getChildrenIndex(roWidgets, id, firstChildIndex);
	for (let i = 0; i < children.length; i++) {
		const eachWidget = roWidgets[children[i]];
		renderWidget(writer, eachWidget, i);
	}
}
