import { ExternalGameCoordinatorTypes } from "../TypePackages/game-coordinator-types";

export function hasPermission(
	permissionData: ExternalGameCoordinatorTypes.ModerationRolePermissionsData,
	path: string[],
): boolean {
	let node: ExternalGameCoordinatorTypes.PermissionEntry = permissionData.permissions;

	for (const key of path) {
		if (typeof node !== "object") return false;
		node = (node as ExternalGameCoordinatorTypes.PermissionGroup)[key];
		if (node === undefined) return false;
	}

	return node === true;
}
