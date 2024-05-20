import { HeldItemManager } from "@Easy/Core/Shared/Item/HeldItems/HeldItemManager";
import TopDownBattleGame from "./TopDownBattleGame";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";

//There is only one game class so expose it for anyone to access
export const TopDownBattle: TopDownBattleGame =
	GameObject.Find("GameManager").GetAirshipComponent<TopDownBattleGame>()!;

// Create custom ItemTypes
export const enum ItemType {
	TopDownRanged = "TopDownRanged",
}

// Add custom fields to ItemMeta
declare module "@Easy/Core/Shared/Item/ItemDefinitionTypes" {
	export interface ItemDef {
		TopDownRanged?: boolean;
	}
}

ItemUtil.RegisterItem("Weapon01", {
	displayName: "Weapon01",
	maxStackSize: 1,
	accessoryPaths: ["Shared/Resources/Demo/TopDownBattle/Accessories/HeldItems/TopDownBattle_Weapon01.prefab"],
	image: "Shared/Resources/ItemRenders/wood_sword.png",
	usable: {
		startUpInSeconds: 0,
		minChargeSeconds: 0,
		maxChargeSeconds: 0,
		cooldownSeconds: 0.25,
		canHoldToUse: true,
		holdToUseCooldownInSeconds: 0,
		onUseSoundVolume: 0.3,
		maxStackSize: 1,
		onUseSound: [
			//"Shared/Resources/Sound/s_Sword_Swing_Wood_01.wav",
			"Shared/Resources/Sound/s_Sword_Swing_Wood_02.wav",
			"Shared/Resources/Sound/s_Sword_Swing_Wood_03.wav",
			"Shared/Resources/Sound/s_Sword_Swing_Wood_04.wav",
		],
	},
	TopDownRanged: true,
});

HeldItemManager.RegisterHeldItem(
	(itemMeta) => itemMeta.TopDownRanged !== undefined,
	(entity, itemMeta) => new TopDownBattleRangedItem(entity, itemMeta),
);
