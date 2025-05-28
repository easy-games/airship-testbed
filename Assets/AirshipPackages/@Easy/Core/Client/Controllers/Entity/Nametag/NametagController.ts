import { Airship } from "@Easy/Core/Shared/Airship";
import { Asset } from "@Easy/Core/Shared/Asset";
import Character from "@Easy/Core/Shared/Character/Character";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import NametagComponent from "@Easy/Core/Shared/Nametag/NametagComponent";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Signal, SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { Theme } from "@Easy/Core/Shared/Util/Theme";

@Controller({})
export class NametagController {
	private readonly nameTagId = "Nametag";
	private readonly graphicsBundleName = "Graphics";
	public showSelfNametag = false;
	private nametagsEnabled = true;
	// Clean to destroy nametag & related connections
	private nametagBins = new Map<Character, Bin>();
	private allNametags: NametagComponent[] = [];
	private nametagPrefab: GameObject;

	public readonly onNametagCreated = new Signal<[nametag: NametagComponent]>();
	public readonly onNametagDestroyed = new Signal<[nametag: NametagComponent]>();

	protected OnStart(): void {
		Airship.Characters.onCharacterSpawned.ConnectWithPriority(SignalPriority.HIGH, (character) => {
			if (!this.nametagsEnabled) return;

			this.HookCharacterNametag(character);
		});

		Airship.Characters.onCharacterDespawned.Connect((character) => {
			this.nametagBins.get(character)?.Clean();
			this.nametagBins.delete(character);
		});

		// Update nametage for other players when they change teams
		Airship.Teams.onPlayerChangeTeam.Connect((player, newTeam, oldTeam) => {
			if (!this.nametagsEnabled) return;
			if (newTeam) {
				for (const p of newTeam.GetPlayers()) {
					if (p === player || p.IsLocalPlayer()) continue;

					if (p.character) {
						this.UpdateNametag(p.character);
					}
				}
			}

			if (oldTeam) {
				for (const p of oldTeam.GetPlayers()) {
					if (p.character) {
						this.UpdateNametag(p.character);
					}
				}
			}
		});
	}

	private HookCharacterNametag(character: Character): Bin | undefined {
		if (character.IsLocalCharacter() && !this.showSelfNametag) {
			return;
		}

		if (character.rig?.head === undefined) return;

		const bin = new Bin();
		const nameTag = this.UpdateNametag(character);
		if (!nameTag) return;

		if (character.player) {
			bin.Add(
				character.player.onChangeTeam.Connect(() => {
					this.UpdateNametag(character);
				}),
			);
		}

		// const SetNametagAlpha = (character: Character, alpha: number) => {
		// 	nameTag.SetAlpha(alpha);
		// };
		// bin.Add(
		// 	character.onStateChanged.Connect((newState, oldState) => {
		// 		if (newState === CharacterState.Crouching) {
		// 			SetNametagAlpha(character, 0.1);
		// 		} else if (oldState === CharacterState.Crouching) {
		// 			SetNametagAlpha(character, 1);
		// 		}
		// 	}),
		// );
		bin.Add(() => {
			this.FindAndDestroyNametag(character.model.gameObject);
		});
		this.nametagBins.set(character, bin);
		return bin;
	}

	/**
	 * Sets a custom nametag to use for characters in the game
	 * @param prefab The nametag prefab to use
	 */
	public SetNametagPrefab(prefab: GameObject) {
		if (prefab === this.nametagPrefab) return;
		this.nametagPrefab = prefab;

		for (const player of Airship.Players.GetPlayers()) {
			if (!player.character) continue;
			this.nametagBins.get(player.character)?.Clean(); // cleanup old nametag
			this.UpdateNametag(player.character); // create new nametag
		}
	}

	public CreateNametag(parent: Transform, character?: Character): NametagComponent {
		if (parent === undefined) {
			error("Must pass in a valid transform to CreateNametag");
		}

		this.nametagPrefab ??= Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/Nametag.prefab");
		const nametagGo = Object.Instantiate(this.nametagPrefab, parent);
		nametagGo.name = this.nameTagId;

		const nametag = nametagGo.GetAirshipComponent<NametagComponent>();
		assert(nametag, "Missing NametagComponent");
		if (character) {
			nametag.SetCharacter(character);
		}

		this.allNametags.push(nametag);

		return nametag;
	}

	public UpdateNametag(character: Character): NametagComponent | undefined {
		if (character.IsLocalCharacter() && !this.showSelfNametag) return;

		const team: Team | undefined = character.player?.team;
		const localPlayerTeam = Game.localPlayer.team;

		let nameTag = character.gameObject.GetAirshipComponentInChildren<NametagComponent>();
		if (nameTag === undefined) {
			nameTag = this.CreateNametag(character.rig?.head, character);
		}

		// Username text
		let displayName = character.GetDisplayName() || (character.player?.username ?? character.gameObject.name);
		nameTag.SetText(displayName);

		// Username color
		let color: Color | undefined;
		if (localPlayerTeam && team) {
			if (character.player && localPlayerTeam.GetPlayers().has(character.player)) {
				color = Theme.green;
			} else {
				color = Theme.red;
			}
		}

		if (color === undefined) {
			color = Theme.white;
		}

		nameTag.SetTextColor(color);
		nameTag.SetTeam(team);
		return nameTag;
	}

	public DestroyNametag(nametag?: NametagComponent) {
		if (nametag) {
			for (let i = 0; i < this.allNametags.size(); i++) {
				if (nametag === this.allNametags[i]) {
					this.allNametags.remove(i);
					break;
				}
			}
			Object.Destroy(nametag.gameObject);
		}
	}

	public FindAndDestroyNametag(root: GameObject) {
		this.DestroyNametag(root.GetAirshipComponentInChildren<NametagComponent>());
	}

	public SetNametagsEnabled(enabled: boolean) {
		if (enabled === this.nametagsEnabled) return;

		this.nametagsEnabled = enabled;

		// Toggle all existing character nametags
		for (const character of Airship.Characters.GetCharacters()) {
			if (enabled) {
				this.HookCharacterNametag(character);
			} else {
				this.nametagBins.get(character)?.Clean();
				this.nametagBins.delete(character);
			}
		}
	}
}
