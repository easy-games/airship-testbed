interface ItemBaseQueryParameters<T extends "tag" | "class"> {
	queryType: T;
	resourceIds?: [];
}

interface TagQueryParameters extends ItemBaseQueryParameters<"tag"> {
	tags: string[];
}

interface ClassQueryParameters extends ItemBaseQueryParameters<"class"> {
	classIds: string[];
}

export type ItemQueryParameters = ClassQueryParameters | TagQueryParameters;
