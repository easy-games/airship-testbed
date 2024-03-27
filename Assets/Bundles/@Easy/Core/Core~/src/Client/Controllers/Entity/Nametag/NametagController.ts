import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Airship } from "Shared/Airship";
import Character from "Shared/Character/Character";
import { Controller, OnStart } from "Shared/Flamework";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { Team } from "Shared/Team/Team";
import { SignalPriority } from "Shared/Util/Signal";
import { Theme } from "Shared/Util/Theme";

@Controller({})
export class NametagController implements OnStart {
	private readonly nameTagId = "Nametag";
	private readonly graphicsBundleName = "Graphics";
	private showSelfNametag = false;
	private nametagsEnabled = true;
	// Clean to destroy nametag & related connections
	private nametagBins = new Map<Character, Bin>();

	OnStart(): void {
		Airship.characters.onCharacterSpawned.ConnectWithPriority(SignalPriority.HIGH, (character) => {
			if (!this.nametagsEnabled) return;

			this.HookCharacterNametag(character);
		});

		Airship.characters.onCharacterDespawned.Connect((character) => {
			this.nametagBins.get(character)?.Clean();
			this.nametagBins.delete(character);
		});
	}

	private HookCharacterNametag(character: Character): Bin | undefined {
		if (character.IsLocalCharacter() && !this.showSelfNametag) {
			return;
		}
		const bin = new Bin();
		this.UpdateNametag(character);
		const SetNametagAlpha = (character: Character, alpha: number) => {
			const nameTag = character.model.transform.FindChild(this.nameTagId);
			if (nameTag) {
				const canvasGroup = nameTag.GetChild(0).GetComponent<CanvasGroup>();
				canvasGroup.TweenCanvasGroupAlpha(alpha, 0.1);
			}
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

	private CreateNametag(character: Character): GameObject {
		const nametagPrefab = AssetBridge.Instance.LoadAsset(
			"@Easy/Core/Client/Resources/Prefabs/Nametag.prefab",
		) as GameObject;
		const nametag = GameObjectUtil.Instantiate(nametagPrefab);
		nametag.name = this.nameTagId;
		nametag.transform.SetParent(character.model.transform);
		nametag.transform.localPosition = new Vector3(0, 1.8, 0);

		this.UpdateNametag(character);

		return nametag;
	}

	public UpdateNametag(character: Character): void {
		if (character.IsLocalCharacter() && !this.showSelfNametag) return;

		const team: Team | undefined = character.player?.GetTeam();
		const localTeam = Game.localPlayer.GetTeam();

		const nameTag = character.model.transform.FindChild(this.nameTagId);
		if (nameTag === undefined) {
			this.CreateNametag(character);
			return;
		}

		const references = nameTag.gameObject.GetComponent<GameObjectReferences>();
		const textLabel = references.GetValue<TextMeshProUGUI>(this.graphicsBundleName, "Text");
		const teamImage = references.GetValue<UGUIImage>(this.graphicsBundleName, "Team");
		const canvas = references.GetValue<Canvas>(this.graphicsBundleName, "Canvas");

		// Username text
		let displayName = character.player?.username ?? character.gameObject.name;
		textLabel.text = displayName;

		const rawDisplayName = Bridge.RemoveRichText(displayName);
		const rect = canvas.gameObject.GetComponent<RectTransform>();
		rect.sizeDelta = new Vector2(230 * rawDisplayName.size(), 480);

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
		textLabel.color = color;

		// Team image
		if (team) {
			teamImage.color = team.color;
			teamImage.enabled = true;
		} else {
			teamImage.enabled = false;
		}
	}

	public DestroyNametag(character: Character) {
		const nametag = character.model.transform.FindChild(this.nameTagId);
		if (nametag) {
			Object.Destroy(nametag);
		}
	}

	public SetNametagsEnabled(enabled: boolean) {
		if (enabled === this.nametagsEnabled) return;

		this.nametagsEnabled = enabled;

		// Destroy all existing nametags
		for (const character of Airship.characters.GetCharacters()) {
			if (enabled) {
				this.HookCharacterNametag(character);
			} else {
				this.nametagBins.get(character)?.Clean();
				this.nametagBins.delete(character);
			}
		}
	}
}
