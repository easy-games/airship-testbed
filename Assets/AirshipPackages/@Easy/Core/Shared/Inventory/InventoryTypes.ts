export type OpenExternalInventoryResult =
	| [success: true, close: () => void]
	| [success: false, reason: OpenExternalInventoryError];

export enum OpenExternalInventoryError {
	NoInventoryUI,
	UserHasNoPermission,
	FailedSetup,
}
