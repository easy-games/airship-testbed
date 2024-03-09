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
	private readonly nameTageId = "Nametag";
	private readonly graphicsBundleName = "Graphics";
	private showSelfNametag = false;

	OnStart(): void {
		Airship.characters.onCharacterSpawned.ConnectWithPriority(SignalPriority.HIGH, (character) => {
			if (character.IsLocalCharacter() && !this.showSelfNametag) {
				return;
			}
			this.UpdateNametag(character);
			const SetNametagAlpha = (character: Character, alpha: number) => {
				const nameTag = character.model.transform.FindChild(this.nameTageId);
				if (nameTag) {
					const canvasGroup = nameTag.GetChild(0).GetComponent<CanvasGroup>();
					canvasGroup.TweenCanvasGroupAlpha(alpha, 0.1);
				}
				// const healthbar = character.GetHealthbar();
				// if (healthbar) {
				// 	const canvasGroup = healthbar.transform.parent!.GetComponent<CanvasGroup>();
				// 	if (alpha < 1) {
				// 		canvasGroup.TweenCanvasGroupAlpha(alpha * 0.6, 0.1);
				// 	} else {
				// 		canvasGroup.TweenCanvasGroupAlpha(1, 0.1);
				// 	}
				// }
			};
			character.onStateChanged.Connect((newState, oldState) => {
				if (newState === CharacterState.Crouching) {
					SetNametagAlpha(character, 0.1);
				} else if (oldState === CharacterState.Crouching) {
					SetNametagAlpha(character, 1);
				}
			});
		});
		// CoreClientSignals.PlayerChangeTeam.Connect((event) => {
		// 	if (event.player === Game.localPlayer) {
		// 		for (const entity of this.entityController.GetEntities()) {
		// 			this.UpdateNametag(entity);
		// 		}
		// 		return;
		// 	}
		// 	if (event.player.character) {
		// 		this.UpdateNametag(event.player.character);
		// 	}
		// });
		Airship.characters.onCharacterDespawned.Connect((character) => {
			const nameTag = character.model.transform.FindChild(this.nameTageId);
			if (nameTag) {
				Object.Destroy(nameTag.gameObject);
			}
		});
	}

	private CreateNametag(character: Character): GameObject {
		const nametagPrefab = AssetBridge.Instance.LoadAsset(
			"@Easy/Core/Client/Resources/Prefabs/Nametag.prefab",
		) as GameObject;
		const nametag = GameObjectUtil.Instantiate(nametagPrefab);
		nametag.name = this.nameTageId;
		nametag.transform.SetParent(character.model.transform);
		nametag.transform.localPosition = new Vector3(0, 1.8, 0);

		this.UpdateNametag(character);

		return nametag;
	}

	public UpdateNametag(character: Character): void {
		if (character.IsLocalCharacter() && !this.showSelfNametag) return;

		const team: Team | undefined = character.player?.GetTeam();
		const localTeam = Game.localPlayer.GetTeam();

		const nameTag = character.model.transform.FindChild(this.nameTageId);
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
}
