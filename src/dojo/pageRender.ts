import { CodeBlockWriter } from 'ts-morph';
import { AttachedWidget, PageDataItem } from '../interfaces';
import { getChildrenIndex, getVariableNames } from '../util';

let roWidgets: ReadonlyArray<AttachedWidget>;
let variableNames: Map<string, string>;

export function renderPage(writer: CodeBlockWriter, widgets: AttachedWidget[] = [], data: PageDataItem[]): void {
	if (widgets.length === 0) {
		return;
	}

	roWidgets = widgets;
	variableNames = getVariableNames(data);

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
	
	// 如果部件的属性是必填的，则必须在生成模型数据时就处理好默认值。
	widget.properties.forEach((prop) => {
		if(prop.isExpr) {
			const dataId = prop.value;
			if(dataId != undefined) {
				const variableName = variableNames.get(dataId);
				if(variableName != undefined) {
					writer.write(', ');
					// 注意：此处硬编码了特殊逻辑。
					writer.write(prop.name === "dataId"?"value": prop.name).write(': ');
					writer.write(variableName);
				}
			}
		}else {
			const value = prop.value || prop.defaultValue;
			if (value) {
				writer.write(', ');
				writer.write(prop.name).write(': ');
				if (prop.valueType === 'string') {
					writer
						.quote()
						.write(value)
						.quote();
				} else if(prop.valueType === 'boolean' || prop.valueType === 'int' || prop.valueType === 'float' ) {
					writer.write(value);
				} else if(prop.valueType === 'function') {
					writer.write(value);
				}
			}
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
