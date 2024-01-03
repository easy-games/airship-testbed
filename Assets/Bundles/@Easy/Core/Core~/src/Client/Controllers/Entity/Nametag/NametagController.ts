import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { Entity } from "Shared/Entity/Entity";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { Team } from "Shared/Team/Team";
import { SignalPriority } from "Shared/Util/Signal";
import { Theme } from "Shared/Util/Theme";
import { PlayerController } from "../../Player/PlayerController";
import { EntityController } from "../EntityController";

@Controller({})
export class NametagController implements OnStart {
	private readonly nameTageId = "Nametag";
	private readonly graphicsBundleName = "Graphics";
	private showSelfNametag = false;

	constructor(
		private readonly playerController: PlayerController,
		private readonly entityController: EntityController,
	) {}

	OnStart(): void {
		CoreClientSignals.EntitySpawn.ConnectWithPriority(SignalPriority.HIGH, (event) => {
			if (event.entity.IsLocalCharacter() && !this.showSelfNametag) {
				return;
			}
			this.UpdateNametag(event.entity);
			event.entity.onDisplayNameChanged.Connect(() => {
				this.UpdateNametag(event.entity);
			});
			const SetNametagAlpha = (entity: Entity, alpha: number) => {
				const nameTag = entity.model.transform.FindChild(this.nameTageId);
				if (nameTag) {
					const canvasGroup = nameTag.GetChild(0).GetComponent<CanvasGroup>();
					canvasGroup.TweenCanvasGroupAlpha(alpha, 0.1);
				}
				const healthbar = entity.GetHealthbar();
				if (healthbar) {
					const canvasGroup = healthbar.transform.parent.GetComponent<CanvasGroup>();
					if (alpha < 1) {
						canvasGroup.TweenCanvasGroupAlpha(alpha * 0.6, 0.1);
					} else {
						canvasGroup.TweenCanvasGroupAlpha(1, 0.1);
					}
				}
			};
			event.entity.onStateChanged.Connect((newState, oldState) => {
				if (newState === EntityState.Crouching) {
					SetNametagAlpha(event.entity, 0.1);
				} else if (oldState === EntityState.Crouching) {
					SetNametagAlpha(event.entity, 1);
				}
			});
		});
		CoreClientSignals.PlayerChangeTeam.Connect((event) => {
			if (event.player === Game.localPlayer) {
				for (const entity of this.entityController.GetEntities()) {
					this.UpdateNametag(entity);
				}
				return;
			}
			if (event.player.character) {
				this.UpdateNametag(event.player.character);
			}
		});
		CoreClientSignals.EntityDespawn.Connect((entity) => {
			const nameTag = entity.model.transform.FindChild(this.nameTageId);
			if (nameTag) {
				Object.Destroy(nameTag.gameObject);
			}
		});
	}

	private CreateNametag(entity: Entity): GameObject {
		const nametagPrefab = AssetBridge.Instance.LoadAsset(
			"@Easy/Core/Client/Resources/Prefabs/Nametag.prefab",
		) as GameObject;
		const nametag = GameObjectUtil.Instantiate(nametagPrefab);
		nametag.name = this.nameTageId;
		nametag.transform.SetParent(entity.model.transform);
		nametag.transform.localPosition = new Vector3(0, 2.3, 0);

		this.UpdateNametag(entity);

		return nametag;
	}

	public UpdateNametag(entity: Entity): void {
		if (entity.IsLocalCharacter()) return;

		const team: Team | undefined = entity.player?.GetTeam();
		const localTeam = Game.localPlayer.GetTeam();

		const nameTag = entity.model.transform.FindChild(this.nameTageId);
		if (nameTag === undefined) {
			this.CreateNametag(entity);
			return;
		}

		const references = nameTag.gameObject.GetComponent<GameObjectReferences>();
		const textLabel = references.GetValue<TextMeshProUGUI>(this.graphicsBundleName, "Text");
		const teamImage = references.GetValue<UGUIImage>(this.graphicsBundleName, "Team");
		const canvas = references.GetValue<Canvas>(this.graphicsBundleName, "Canvas");

		// Username text
		let displayName = entity.GetDisplayName();
		textLabel.text = displayName;

		const rawDisplayName = Bridge.RemoveRichText(displayName);
		const rect = canvas.gameObject.GetComponent<RectTransform>();
		rect.sizeDelta = new Vector2(230 * rawDisplayName.size(), 480);

		// Username color
		let color: Color | undefined;
		if (localTeam) {
			if (entity.player && localTeam.GetPlayers().has(entity.player)) {
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
