export interface ProjectInfo {
	name: string;
	label: string;
	version: string;
}

export interface PackageJson {
	name: string;
	version: string;
}

export interface Depencency {
	name: string;
	version: string;
}

export interface PageInfo {
	id: number;
	key: string;
}

export interface AttachedWidget {
	id: string;
	parentId: string;
	widgetName: string;
	canHasChildren: boolean;
	properties: AttachedWidgetProperty[];
}

export type PropertyValueType = 'string' | 'int' | 'float' | 'date' | 'boolean' | 'function';

export interface AttachedWidgetProperty {
	name: string;
	defaultValue?: string;
	valueType: PropertyValueType;
	id: string;
	value?: string;
	isExpr: boolean;
}

export interface PageModel {
	pageInfo: PageInfo;
	widgets: AttachedWidget[];
}
