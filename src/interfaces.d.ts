export interface ProjectInfo {
	name: string;
	label: string;
	version: string;
}

export interface PackageJson {
	name: string;
	version: string;
}

export interface Dependency {
	name: string;
	version: string;
	apiRepoId: number;
}

// 注意：Dependency 和 ComponentRepo 功能有些重叠，待进一步明确。

export interface PageInfo {
	id: number;
	key: string;
	groupPath: string;
}

export interface AttachedWidget {
	id: string;
	parentId: string;
	apiRepoId: number;
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
