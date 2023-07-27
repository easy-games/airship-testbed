import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { Entity } from "Shared/Entity/Entity";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObjectBridge";
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
		ClientSignals.EntitySpawn.ConnectWithPriority(SignalPriority.HIGH, (event) => {
			if (event.entity.IsLocalCharacter() && !this.showSelfNametag) {
				return;
			}
			this.CreateNametag(event.entity);
		});

		ClientSignals.PlayerChangeTeam.Connect((event) => {
			if (event.Player === Game.LocalPlayer) {
				for (const entity of this.entityController.GetEntities()) {
					this.UpdateNametag(entity);
				}
				return;
			}

			if (event.Player.Character) {
				this.UpdateNametag(event.Player.Character);
			}
		});
	}

	public CreateNametag(entity: Entity): GameObject {
		const nametagPrefab = AssetBridge.LoadAsset("Client/Resources/Prefabs/Nametag.prefab") as GameObject;
		const nametag = GameObjectUtil.Instantiate(nametagPrefab);
		nametag.name = this.nameTageId;
		nametag.transform.parent = entity.model.transform;
		nametag.transform.localPosition = new Vector3(0, 2.3, 0);

		this.UpdateNametag(entity);

		return nametag;
	}

	private UpdateNametag(entity: Entity): void {
		const team: Team | undefined = entity.player?.GetTeam();
		const localTeam = Game.LocalPlayer.GetTeam();

		const nameTag = entity.model.transform.FindChild(this.nameTageId);
		if (nameTag === undefined) {
			this.CreateNametag(entity);
			return;
		}

		const references = nameTag.gameObject.GetComponent<GameObjectReferences>();
		const textLabel = references.GetValue<TextMeshProUGUI>(this.graphicsBundleName, "Text");
		const teamImage = references.GetValue<UGUIImage>(this.graphicsBundleName, "Team");

		// Username text
		let displayName = `Entity${entity.id}`;
		if (entity.player) {
			displayName = entity.player.username;
		}
		textLabel.text = displayName;

		// Username color
		let color: Color | undefined;
		if (localTeam) {
			if (entity.player && localTeam.GetPlayers().has(entity.player)) {
				color = Theme.Green;
			} else {
				color = Theme.Red;
			}
		}
		if (color === undefined) {
			color = Theme.White;
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
