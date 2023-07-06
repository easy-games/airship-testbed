import { Controller, OnStart } from "@easy-games/flamework-core";
import { CollectionManager } from "Shared/Util/CollectionManager";
import { CollectionTag } from "Shared/Util/CollectionTag";
import { ItemShopController } from "../Global/ItemShop/ItemShopController";
import { ProximityPrompt } from "../Global/ProximityPrompt/ProximityPrompt";
import { TeamUpgradeController } from "../Global/TeamUpgrade/TeamUpgradeController";

/** Proximity prompt offset. */
const PROXIMITY_PROMPT_OFFSET = new Vector3(0, 1.5, 0);

@Controller({})
export class ShopkeeperController implements OnStart {
	constructor(
		private readonly teamUpgradeController: TeamUpgradeController,
		private readonly itemShopController: ItemShopController,
	) {}

	OnStart(): void {
		/* Listen for shopkeeper creation and create proximity prompts accordingly. */
		CollectionManager.WatchCollectionTag(CollectionTag.ITEM_SHOP_SHOPKEEPER, (gameObject) => {
			const prompt = new ProximityPrompt({
				promptPosition: gameObject.transform.position.add(PROXIMITY_PROMPT_OFFSET),
				activationKey: Key.F,
				activationKeyString: "F",
				activationRange: 3.5,
				bottomText: "Item Shop",
				topText: "Open",
			});
			/* Open shop UI on prompt activation. */
			prompt.OnActivated.Connect(() => {
				this.itemShopController.Open();
			});
		});
		CollectionManager.WatchCollectionTag(CollectionTag.TEAM_UPGRADES_SHOPKEEPER, (gameObject) => {
			const prompt = new ProximityPrompt({
				promptPosition: gameObject.transform.position.add(PROXIMITY_PROMPT_OFFSET),
				activationKey: Key.F,
				activationKeyString: "F",
				activationRange: 3.5,
				bottomText: "Upgrades",
				topText: "Open",
			});
			/* Open team upgrade UI on prompt activation. */
			prompt.OnActivated.Connect(() => {
				this.teamUpgradeController.Open();
			});
		});
	}
}
