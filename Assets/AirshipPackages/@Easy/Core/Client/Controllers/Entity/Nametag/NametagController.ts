import { Airship } from "@Easy/Core/Shared/Airship";
import { Asset } from "@Easy/Core/Shared/Asset";
import Character from "@Easy/Core/Shared/Character/Character";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import NametagComponent from "@Easy/Core/Shared/Nametag/NametagComponent";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { Theme } from "@Easy/Core/Shared/Util/Theme";

@Controller({})
export class NametagController {
	private readonly nameTagId = "Nametag";
	private readonly graphicsBundleName = "Graphics";
	private showSelfNametag = false;
	private nametagsEnabled = true;
	// Clean to destroy nametag & related connections
	private nametagBins = new Map<Character, Bin>();

	protected OnStart(): void {
		Airship.Characters.onCharacterSpawned.ConnectWithPriority(SignalPriority.HIGH, (character) => {
			if (!this.nametagsEnabled) return;

			this.HookCharacterNametag(character);
		});

		Airship.Characters.onCharacterDespawned.Connect((character) => {
			this.nametagBins.get(character)?.Clean();
			this.nametagBins.delete(character);
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

		const SetNametagAlpha = (character: Character, alpha: number) => {
			nameTag.SetAlpha(alpha);
		};
		bin.Add(
			character.onStateChanged.Connect((newState, oldState) => {
				if (newState === CharacterState.Crouching) {
					SetNametagAlpha(character, 0.1);
				} else if (oldState === CharacterState.Crouching) {
					SetNametagAlpha(character, 1);
				}
			}),
		);
		bin.Add(() => {
			this.DestroyNametag(character);
		});
		this.nametagBins.set(character, bin);
		return bin;
	}

	private CreateNametag(character: Character): NametagComponent {
		const nametagPrefab = Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/Nametag.prefab");
		const nametagGo = Object.Instantiate(nametagPrefab, character.rig?.head);
		nametagGo.name = this.nameTagId;

		const nameTag = nametagGo.GetAirshipComponent<NametagComponent>();
		assert(nameTag, "Missing NametagComponent");

		return nameTag;
	}

	public UpdateNametag(character: Character): NametagComponent | undefined {
		if (character.IsLocalCharacter() && !this.showSelfNametag) return;

		const team: Team | undefined = character.player?.team;
		const localTeam = Game.localPlayer.team;

		let nameTag = character.gameObject.GetAirshipComponentInChildren<NametagComponent>();
		if (nameTag === undefined) {
			nameTag = this.CreateNametag(character);
		}

		// Username text
		let displayName = character.GetDisplayName() || (character.player?.username ?? character.gameObject.name);
		nameTag.SetText(displayName);

		// Username color
		let color: Color | undefined;
		if (localTeam) {
			if (character.player && localTeam.GetPlayers().has(character.player)) {
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

	public DestroyNametag(character: Character) {
		const nametag = character.model.gameObject.GetAirshipComponentInChildren<NametagComponent>();
		if (nametag) {
			Object.Destroy(nametag.gameObject);
		}
	}

	public SetNametagsEnabled(enabled: boolean) {
		if (enabled === this.nametagsEnabled) return;

		this.nametagsEnabled = enabled;

		// Destroy all existing nametags
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
