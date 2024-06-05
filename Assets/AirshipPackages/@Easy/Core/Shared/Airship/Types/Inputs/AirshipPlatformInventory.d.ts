interface ItemBaseQueryParameters<T extends "tag" | "class"> {
	queryType: T;
	resourceIds?: string[];
}

interface TagQueryParameters extends ItemBaseQueryParameters<"tag"> {
	tags: string[];
}

interface ClassQueryParameters extends ItemBaseQueryParameters<"class"> {
	classIds: string[];
}

export type ItemQueryParameters = ClassQueryParameters | TagQueryParameters;
