import { Airship } from "../Airship";
import { Asset } from "../Asset";
import { AudioManager } from "../Audio/AudioManager";
import { CoreNetwork } from "../CoreNetwork";
import { Game } from "../Game";
import { Binding } from "../Input/Binding";
import { InternalRadialUI } from "../UI/RadialMenu/InternalRadialUI";
import { EmoteDefinition } from "./EmoteDefinition";
import { EmoteId } from "./EmoteId";
import { InternalEmoteDefinitions } from "./InternalEmoteDef";

export default class InternalEmoteMenu extends AirshipBehaviour {
	public radialMenu: InternalRadialUI;

	override Start(): void {
		task.wait(0.1);
		this.radialMenu.SetItems([
			InternalEmoteDefinitions[EmoteId.CutThroat],
			InternalEmoteDefinitions[EmoteId.FingerGun],
			InternalEmoteDefinitions[EmoteId.Point],
			InternalEmoteDefinitions[EmoteId.ThumbsUp],
			InternalEmoteDefinitions[EmoteId.ThumbsDown],
			InternalEmoteDefinitions[EmoteId.HandsUp],
			InternalEmoteDefinitions[EmoteId.Wave],
		]);
		Airship.Input.CreateAction("Emote", Binding.Key(Key.B));

		Airship.Input.OnDown("Emote").Connect((e) => {
			if (e.uiProcessed) return;
			if (!Game.localPlayer.character?.IsAlive()) return;

			this.radialMenu.Show();
		});
		Airship.Input.OnUp("Emote").Connect((e) => {
			this.radialMenu.Hide();
		});

		this.radialMenu.onSelectionChanged.Connect(() => {
			AudioManager.PlayClipGlobal(Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Sound/UI_Switch.wav"), {
				volumeScale: 0.04,
			});
		});

		this.radialMenu.onSubmit.Connect((data) => {
			if (!data) return;
			const emoteDef = data as EmoteDefinition;
			CoreNetwork.ClientToServer.Character.EmoteRequest.client.FireServer(emoteDef.id);
			AudioManager.PlayClipGlobal(Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Sound/UI_Select.wav"), {
				volumeScale: 0.08,
			});
		});
	}

	override OnDestroy(): void {}
}
