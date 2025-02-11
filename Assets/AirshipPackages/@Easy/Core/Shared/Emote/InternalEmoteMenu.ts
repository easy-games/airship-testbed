import { Airship } from "../Airship";
import { Asset } from "../Asset";
import { Game } from "../Game";
import { Binding } from "../Input/Binding";
import { InternalRadialUI } from "../UI/RadialMenu/InternalRadialUI";
import { EmoteId } from "./EmoteId";
import { InternalEmoteDef, InternalEmoteDefinitions } from "./InternalEmoteDef";

export default class InternalEmoteMenu extends AirshipBehaviour {
	public radialMenu: InternalRadialUI;

	override Start(): void {
		this.radialMenu.SetItems([
			InternalEmoteDefinitions[EmoteId.Wave],
			InternalEmoteDefinitions[EmoteId.CutThroat],
			InternalEmoteDefinitions[EmoteId.FingerGun],
		]);
		Airship.Input.CreateAction("Emote", Binding.Key(Key.B));

		Airship.Input.OnDown("Emote").Connect((e) => {
			if (e.uiProcessed) return;

			this.radialMenu.Show();
		});
		Airship.Input.OnUp("Emote").Connect((e) => {
			this.radialMenu.Hide();
		});

		this.radialMenu.onSubmit.Connect((data) => {
			if (!data) return;
			const emoteDef = data as InternalEmoteDef;
			const anim = Asset.LoadAsset<AnimationClip>(emoteDef.anim);
			Game.localPlayer.character?.animationHelper.PlayAnimation(anim, CharacterAnimationLayer.OVERRIDE_3, 0.1);
		});
	}

	override OnDestroy(): void {}
}
