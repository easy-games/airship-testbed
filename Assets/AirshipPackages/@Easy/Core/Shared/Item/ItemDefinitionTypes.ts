import { PlaySoundConfig } from "@Easy/Core/Shared/Audio/AudioManager";

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

export interface ItemDef {
	//Identification
	displayName: string;

	/**
	 * Path to accessories that should be equipped when item is held.
	 */
	accessoryPaths?: string[];

	/**
	 * Runtime ID. This may change between sessions.
	 * For a consistent ID, you should use {@link itemType}.
	 */
	internalId: number;
	itemType: string;

	/** Path to image. */
	image?: string;

	maxStackSize?: number;

	data?: {
		[x: string | number]: any;
	};
}
