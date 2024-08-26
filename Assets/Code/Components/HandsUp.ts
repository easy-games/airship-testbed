import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { Binding } from "@Easy/Core/Shared/Input/Binding";

export default class HandsUp extends AirshipBehaviour {
	public handsUpAnim: AnimationClip;
	private playing = false;

	override Start(): void {
		Airship.Input.CreateAction("HandsUp", Binding.Key(Key.J));
		Airship.Input.OnDown("HandsUp").Connect((event) => {
			if (event.uiProcessed) return;
			if (!Game.localPlayer.character) return;

			if (this.playing) {
				this.playing = false;
				Game.localPlayer.character.animationHelper.StopAnimation(CharacterAnimationLayer.Override1, 0.15);
			} else {
				this.playing = true;
				Game.localPlayer.character.animationHelper.PlayAnimation(
					this.handsUpAnim,
					CharacterAnimationLayer.Override1,
					0.15,
				);
			}
		});
	}

	override OnDestroy(): void {}
}
