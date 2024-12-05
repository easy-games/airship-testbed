import Character from "../Character/Character";
import { Signal } from "../Util/Signal";
import { CameraTransform } from "./CameraTransform";

/**
 * Represents a camera mode's target.
 */
interface CameraTarget {
	/**
	 * The `GameObject` camera is targetting, if it exists. Otherwise, `undefined`.
	 */
	target?: GameObject;
	/**
	 * The `Character` camera is targetting, if it exists. Otherwise, `undefined`.
	 */
	character?: Character;
}

/**
 * Represents a camera mode that can attached to the camera system.
 */
export abstract class CameraMode {
	/**
	 * The camera's target `GameObject`.
	 */
	protected target: GameObject | undefined;
	/**
	 * The character that camera is currently targeting. This is _only_ set when
	 * the target `GameObject` has a `Character` component attached to it, or if one
	 * of it's ancestors or descendents has a `Character` component.
	 */
	protected character: Character | undefined;
	/**
	 * Signal that is fired when the camera mode's target is changed.
	 */
	public onTargetChanged = new Signal<{ before: CameraTarget; after: CameraTarget }>();

	public rotationX = math.rad(90);
	public rotationY = math.rad(0);

	constructor(target?: GameObject) {
		if (target) {
			this.SetTarget(target);
		}
	}

	/**
	 * Sets camera mode's new target and fires the `onTargetChanged` signal. This only affects
	 * camera modes that use the `target` and `character` fields, and not static modes like
	 * `FlyCameraMode`.
	 *
	 * @param target The camera's new target.
	 */
	public SetTarget(target: GameObject): void {
		const oldTarget = this.target;
		const oldCharacter = this.character;
		this.target = target;
		if (target) {
			this.character = target.GetAirshipComponent<Character>();
			if (!this.character) {
				this.character =
					target.GetAirshipComponentInChildren<Character>() ??
					target.GetAirshipComponentInParent<Character>();
			}
		}
		this.onTargetChanged.Fire({
			before: {
				target: oldTarget,
				character: oldCharacter,
			},
			after: {
				target: this.target,
				character: this.character,
			},
		});
	}

	/**
	 * Returns this camera mode's target, if it exists. Otherwise this function returns
	 * `undefined`.
	 *
	 * @returns This camera's target, if it exists, otherwise `undefined`.
	 */
	public GetTarget(): GameObject | undefined {
		return this.target;
	}

	/**
	 * Returns this camera mode's `Character` target, if it exists. A character target only
	 * exists if it's target `GameObject`, or any ancestors or descendants contain a `Character`
	 * component.
	 *
	 * @returns This camera's `Character` target, if it exists, otherwise `undefined`.
	 */
	public GetCharacterTarget(): Character | undefined {
		return this.character;
	}

	/** Called when the camera mode is enabled. */
	public OnEnabled(): void {}

	abstract GetFriendlyName(): string;

	/** Called when the camera mode starts. */
	abstract OnStart(camera: Camera, rootTransform: Transform): void;

	/** Called when the camera mode stops. */
	abstract OnStop(): void;

	/** Called every frame. Useful for control logic. */
	abstract OnUpdate(deltaTime: number): void;

	/** Called every frame. Use this method for constructing the `CameraTransform`. */
	abstract OnLateUpdate(deltaTime: number): CameraTransform;

	abstract OnPostUpdate(cameraHolder: Transform): void;
}

// Necessary for our Lua plugin to not complain about return type:
export default {};
