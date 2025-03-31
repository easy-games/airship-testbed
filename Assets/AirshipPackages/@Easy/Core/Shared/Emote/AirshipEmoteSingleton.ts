import { Airship } from "../Airship";
import { Asset } from "../Asset";
import Character from "../Character/Character";
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

			CoreNetwork.ServerToClient.Character.EmoteStart.server.FireAllClients(player.character.id, emoteId);
		});

		CoreNetwork.ClientToServer.Character.EmoteCancelRequest.server.OnClientEvent((player) => {
			if (!player.character) return;
			if (!player.character.isEmoting) return;

			player.character.isEmoting = false;
			player.character.onEmoteEnd.Fire();
			CoreNetwork.ServerToClient.Character.EmoteEnd.server.FireExcept(player, player.character.id);
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

			const startSignal = character.onEmoteStart.Fire(new EmoteStartSignal(emoteId));
			if (startSignal.IsCancelled()) return;

			const anim = Asset.LoadAsset<AnimationClip>(def.anim);
			character.animationHelper.PlayAnimation(anim, CharacterAnimationLayer.OVERRIDE_3, def.fadeInTime ?? 0.1);
			character.isEmoting = true;

			const length = def.duration ?? anim.length;
			const emoteBin = new Bin();
			let alive = true;
			emoteBin.Add(
				character.onEmoteEnd.ConnectWithPriority(SignalPriority.HIGHEST, () => {
					emoteBin.Clean();
				}),
			);
			emoteBin.Add(() => {
				alive = false;
			});
			task.delay(length, () => {
				if (alive) {
					emoteBin.Clean();
					if (anim.isLooping) {
						character.isEmoting = false;
						character.animationHelper.StopAnimation(
							CharacterAnimationLayer.OVERRIDE_3,
							def.fadeOutTime ?? 0.1,
						);
					}
					character.isEmoting = false;
					character.onEmoteEnd.Fire();
				}
			});
		});

		CoreNetwork.ServerToClient.Character.EmoteEnd.client.OnServerEvent((characterId) => {
			const character = Airship.Characters.FindById(characterId);
			if (!character || !character.IsAlive()) return;
			if (!character.isEmoting) return;

			this.StopEmoting(character);
		});
	}

	public StopEmoting(character: Character, fadeOutTime = 0.1): void {
		character.isEmoting = false;
		character.animationHelper.StopAnimation(CharacterAnimationLayer.OVERRIDE_3, fadeOutTime);
		character.onEmoteEnd.Fire();
	}
}
