import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";

export default class CharacterForceTrigger extends AirshipBehaviour {
	public collider?: BoxCollider;
	public forceSpace = Space.Self;
	public triggerForce = Vector3.up;

	private characterInCollider = false;

	public Awake(): void {
		if (!this.collider) {
			this.collider = this.gameObject.GetComponent<BoxCollider>();
		}
		if (!this.collider) {
			return;
		}
		// let bounds = this.collider.bounds;
		// Airship.Characters.onCharacterSpawned.Connect((character) => {
		// 	if (Game.IsClient() && !character.IsLocalCharacter()) {
		// 		return;
		// 	}

		// 	let characterTransform = character.transform;
		// 	//Locally we want to refresh our colliders during replays
		// 	character.OnUseCustomMoveData.Connect((customData, inputData, isReplay) => {
		// 		if (bounds.Contains(characterTransform.position)) {
		// 			if (!this.characterInCollider) {
		// 				this.characterInCollider = true;
		// 				character.movement!.AddImpulse(
		// 					this.forceSpace === Space.Self
		// 						? this.transform.TransformVector(this.triggerForce)
		// 						: this.triggerForce,
		// 				);
		// 			}
		// 		} else {
		// 			this.characterInCollider = false;
		// 		}
		// 	});
		// });
	}

	protected LateUpdate(dt: number): void {
		let characterMovement = Airship.Characters.localCharacterManager.GetEntityDriver();
		if (!characterMovement || !this.collider) {
			return;
		}

		let bounds = this.collider.bounds;
		if (bounds.Contains(characterMovement.rootTransform.position)) {
			if (!this.characterInCollider) {
				this.characterInCollider = true;
				characterMovement!.AddImpulse(
					this.forceSpace === Space.Self
						? this.transform.TransformVector(this.triggerForce)
						: this.triggerForce,
				);
			}
		} else {
			this.characterInCollider = false;
		}
	}
}
