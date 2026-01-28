import { CoreAction } from "../AirshipCoreAction";

export interface MobileButtonConfig {
	/**
	 * A path to an image.
	 */
	icon?: string;
	/**
	 * The icon's scale.
	 */
	scale?: Vector2;
	/**
	 * The button's minimum anchor.
	 */
	anchorMin?: Vector2;
	/**
	 * The button's maximum anchor.
	 */
	anchorMax?: Vector2;
	/**
	 * The button's pivot.
	 */
	pivot?: Vector2;

	prefab?: GameObject;

	cooldown?: {
		cooldownTime: number;
	};
}

export enum CoreMobileButton {
	Jump = "Jump",
	CrouchToggle = "CrouchToggle",
	SprintToggle = "SprintToggle",
}

export const CoreMobileButtonToCoreAction = {
	[CoreMobileButton.Jump]: CoreAction.Jump,
	[CoreMobileButton.CrouchToggle]: CoreAction.Crouch,
	[CoreMobileButton.SprintToggle]: CoreAction.Sprint,
};
