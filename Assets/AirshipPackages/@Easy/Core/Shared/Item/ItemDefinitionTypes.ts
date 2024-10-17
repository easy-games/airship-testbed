import { PlaySoundConfig } from "@Easy/Core/Shared/Audio/AudioManager";
import { Airship } from "../Airship";

export type SoundDef = { path: string } & PlaySoundConfig;

// export interface HoldConfig {
// 	worldmodel?: {
// 		idleAnim?: string[];
// 		equipAnim?: string[];
// 		unequipAnim?: string[];
// 	};
// 	viewmodel?: {
// 		idleAnim?: string[];
// 		equipAnim?: string[];
// 		unequipAnim?: string[];
// 	};
// 	equipSound?: string[];
// }

export interface ItemDefExtraData {
	// [x: string | number]: any;
}

export interface ItemDef {
	//Identification
	displayName: string;

	/**
	 * Path to accessories that should be equipped when item is held.
	 */
	accessoryPaths?: string[];

	/**
	 * A runtime ID for the ItemType. This may change between sessions.
	 *
	 * This useful for networking. Sending this integer ID requires less bandwidth than an ItemType string.
	 *
	 * You can convert internalId to itemType with {@link Airship.Inventory.GetItemTypeFromInternalId}
	 *
	 * For a consistent ID, you should use {@link itemType}.
	 */
	internalId: number;
	itemType: string;

	/** Path to image. */
	image?: string;

	maxStackSize?: number;

	data?: ItemDefExtraData;
}
