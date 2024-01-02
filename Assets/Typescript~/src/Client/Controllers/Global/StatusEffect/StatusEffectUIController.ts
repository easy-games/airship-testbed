import { Game } from "@Easy/Core/Shared/Game";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { GetStatusEffectMeta } from "Shared/StatusEffect/StatusEffectDefinitions";
import { StatusEffectType } from "Shared/StatusEffect/StatusEffectType";
import { StatusEffectUtil } from "Shared/StatusEffect/StatusEffectUtil";

@Controller({})
export class StatusEffectUIController implements OnStart {
	/** The status effect container. Lives at the **top center** of the HUD. */
	private statusEffectContainer: GameObject;
	/** Status effect icon prefab. */
	private statusEffectIconPrefab: GameObject;
	/** Mapping of status effect icon to status effect type. */
	private statusEffectMap = new Map<StatusEffectType, GameObject>();

	constructor() {
		const statusEffectGameObject = GameObject.Find("StatusEffectContainer");
		this.statusEffectContainer = statusEffectGameObject.transform.FindChild("Container")!.gameObject;
		this.statusEffectIconPrefab = AssetBridge.Instance.LoadAsset(
			"Shared/Resources/Prefabs/GameUI/StatusEffectIcon.prefab",
		);
	}

	OnStart(): void {
		ClientSignals.StatusEffectAdded.Connect((clientId, statusEffectType, tier) => {
			if (clientId === Game.LocalPlayer.clientId) {
				this.CreateStatusEffectIcon(statusEffectType, tier);
			}
		});
		ClientSignals.StatusEffectRemoved.Connect((clientId, statusEffectType) => {
			if (clientId === Game.LocalPlayer.clientId) {
				this.RemoveStatusEffectIcon(statusEffectType);
			}
		});
	}

	/**
	 * Creates status effect icon based on provided status effect type and tier.
	 *
	 * @param statusEffectType The type of status effect icon being created.
	 * @param tier The tier of the status effect being created.
	 */
	private CreateStatusEffectIcon(statusEffectType: StatusEffectType, tier: number): void {
		const statusEffectMeta = GetStatusEffectMeta(statusEffectType);
		const iconGameObject = GameObjectUtil.InstantiateIn(
			this.statusEffectIconPrefab,
			this.statusEffectContainer.transform,
		);
		const iconRefs = iconGameObject.GetComponent<GameObjectReferences>();
		const iconImage = iconRefs.GetValue<Image>("IconComponents", "Icon");
		// TODO: Do we need a sprite cache here? This _should_ happen infrequently enough that
		// this doesn't matter, but it might be worth looking into.
		const iconTexture = AssetBridge.Instance.LoadAsset<Texture2D>(statusEffectMeta.icon);
		print(iconTexture);
		iconImage.sprite = Bridge.MakeSprite(iconTexture);
		const iconTier = iconRefs.GetValue<TextMeshProUGUI>("IconComponents", "Tier");
		iconTier.text = StatusEffectUtil.DecimalToRomanNumeral(tier);
		this.statusEffectMap.set(statusEffectType, iconGameObject);
	}

	/**
	 * Removes status effect icon based on provided status effect type.
	 *
	 * @param statusEffectType The type of status effect icon being removed.
	 */
	private RemoveStatusEffectIcon(statusEffectType: StatusEffectType): void {
		const iconGameObject = this.statusEffectMap.get(statusEffectType);
		if (iconGameObject) {
			GameObjectUtil.Destroy(iconGameObject);
			this.statusEffectMap.delete(statusEffectType);
		}
	}
}
