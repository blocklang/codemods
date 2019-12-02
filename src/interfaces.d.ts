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

export interface PageModel {
	pageInfo: PageInfo;
}
