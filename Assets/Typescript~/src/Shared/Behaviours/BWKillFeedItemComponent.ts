import { DamageType } from "@Easy/Core/Shared/Damage/DamageType";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";

const FRIENDLY_COLOR = new Color(70 / 255, 167 / 255, 253 / 255, 0.8);
const HOSTILE_COLOR = new Color(0xfd / 255, 0x57 / 255, 0x46 / 255, 0.8);
const SELF_COLOR = new Color(0xfd / 255, 0xba / 255, 0x46 / 255, 0.8);

export enum KillFeedColor {
	Hostile,
	Friendly,
	Self,
}

const EntityTypeColorMap: Record<KillFeedColor, Color> = {
	[KillFeedColor.Friendly]: FRIENDLY_COLOR,
	[KillFeedColor.Hostile]: HOSTILE_COLOR,
	[KillFeedColor.Self]: SELF_COLOR,
};

export default class BWKillFeedItemComponent extends AirshipBehaviour {
	private attackerName!: TMP_Text;
	private targetName!: TMP_Text;

	private attackerImage!: Image;
	private targetImage!: Image;
	private damageTypeImage!: Image;

	private attackerGo!: GameObject;
	private targetGo!: GameObject;

	public override OnAwake(): void {
		const references = this.gameObject.GetComponent<GameObjectReferences>();

		this.attackerName = references.GetValue("UI", "AttackerName") as TMP_Text;
		this.targetName = references.GetValue("UI", "TargetName") as TMP_Text;

		this.attackerImage = references.GetValue("UI", "AttackerImage") as Image;
		this.targetImage = references.GetValue("UI", "TargetImage") as Image;
		this.damageTypeImage = references.GetValue("UI", "DamageTypeImage") as Image;

		this.attackerGo = references.GetValue("GameObjects", "Attacker") as GameObject;
		this.targetGo = references.GetValue("GameObjects", "Target") as GameObject;
	}

	public override OnStart(): void {}

	private GetEntryColor(entity: Entity): KillFeedColor {
		const localPlayer = Game.localPlayer;
		if (localPlayer === entity.player) {
			return KillFeedColor.Self;
		}

		const attackerTeam = entity.GetTeam();
		const localTeam = localPlayer.GetTeam();
		if (attackerTeam === localTeam) {
			return KillFeedColor.Friendly;
		} else {
			return KillFeedColor.Hostile;
		}
	}

	private SetAttacker(name: string, color: KillFeedColor) {
		this.attackerName.text = name;
		this.attackerImage.color = EntityTypeColorMap[color];
	}

	private SetTarget(name: string, color: KillFeedColor) {
		this.targetName.text = name;
		this.targetImage.color = EntityTypeColorMap[color];
	}

	public SetAttackEntity(entity: Entity | undefined) {
		if (entity) {
			this.attackerGo.active = true;
			this.SetAttacker(entity.GetDisplayName(), this.GetEntryColor(entity));
		} else {
			this.attackerGo.active = false;
		}
	}

	public SetDamageType(damageType: DamageType) {
		let iconPath = "Shared/Resources/Images/DamageType/Sword.png";

		switch (damageType) {
			case DamageType.FALL:
			case DamageType.VOID:
				iconPath = "Shared/Resources/Images/DamageType/Falling.png";
				break;
			case DamageType.PROJECTILE:
				iconPath = "Shared/Resources/Images/DamageType/Bow.png";
				break;
			case DamageType.FIRE:
				iconPath = "Shared/Resources/Images/DamageType/Fire.png";
				break;
			case DamageType.ELECTRIC:
				iconPath = "Shared/Resources/Images/DamageType/Electric.png";
				break;
		}

		const iconTexture = AssetBridge.Instance.LoadAsset<Texture2D>(iconPath);
		this.damageTypeImage.sprite = Bridge.MakeSprite(iconTexture);
	}

	public SetKilledEntity(target: Entity) {
		this.SetTarget(target.GetDisplayName(), this.GetEntryColor(target));
	}
}
