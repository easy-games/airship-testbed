import { Airship } from "../Airship";
import { Asset } from "../Asset";
import { EmoteStartSignal } from "../Character/Signal/EmoteStartSignal";
import { CoreNetwork } from "../CoreNetwork";
import { CoreRefs } from "../CoreRefs";
import { OnStart, Singleton } from "../Flamework";
import { Game } from "../Game";
import { Bin } from "../Util/Bin";
import { SignalPriority } from "../Util/Signal";
import { EmoteDefinition } from "./EmoteDefinition";
import { EmoteId } from "./EmoteId";
import { InternalEmoteDefinitions } from "./InternalEmoteDef";
import InternalEmoteMenu from "./InternalEmoteMenu";

@Singleton({})
export default class AirshipEmoteSingleton implements OnStart {
	private emoteMenu: InternalEmoteMenu;

	public OnStart() {
		if (Game.IsServer()) this.StartServer();
		if (Game.IsClient()) this.StartClient();
	}

	private StartServer(): void {
		CoreNetwork.ClientToServer.Character.EmoteRequest.server.OnClientEvent((player, emoteId) => {
			const emoteDef = InternalEmoteDefinitions[emoteId as EmoteId] as EmoteDefinition | undefined;
			if (!emoteDef) return;
			if (!player.character) return;
			if (player.character.isEmoting) return;

			const startSignal = player.character.onEmoteStart.Fire(new EmoteStartSignal(emoteId));
			if (startSignal.IsCancelled()) return;

			CoreNetwork.ServerToClient.Character.EmoteStart.server.FireAllClients(player.character.id, emoteId);
		});
	}

	private StartClient(): void {
		this.emoteMenu = Object.Instantiate(
			Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/UI/Emote/EmoteMenu.prefab"),
			CoreRefs.rootTransform,
		);
		this.emoteMenu.gameObject.name = "EmoteMenu";

		CoreNetwork.ServerToClient.Character.EmoteStart.client.OnServerEvent((characterId, emoteId) => {
			const character = Airship.Characters.FindById(characterId);
			if (!character) return;
			if (!character.IsAlive()) return;

			const def = InternalEmoteDefinitions[emoteId as EmoteId] as EmoteDefinition | undefined;
			if (!def) return;

			if (character.isEmoting) {
				character.onEmoteEnd.Fire();
			}

			if (!Game.IsHosting()) {
				const startSignal = character.onEmoteStart.Fire(new EmoteStartSignal(emoteId));
				if (startSignal.IsCancelled()) return;
			}

			const anim = Asset.LoadAsset<AnimationClip>(def.anim);
			character.animationHelper.PlayAnimation(anim, CharacterAnimationLayer.OVERRIDE_3, def.fadeInTime ?? 0.1);

			const length = def.duration ?? anim.length;
			const emoteBin = new Bin();
			let alive = true;
			emoteBin.Add(
				character.onEmoteEnd.ConnectWithPriority(SignalPriority.HIGHEST, () => {
					alive = false;
					emoteBin.Clean();
				}),
			);
			if (anim.isLooping) {
				emoteBin.Add(() => {
					character.animationHelper.StopAnimation(CharacterAnimationLayer.OVERRIDE_3, def.fadeOutTime ?? 0.2);
				});
			}
			task.delay(length, () => {
				if (alive) {
					emoteBin.Clean();
					character.onEmoteEnd.Fire();
				}
			});
		});
	}
}
