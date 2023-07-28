import { Controller, OnStart } from "@easy-games/flamework-core";
import { Entity } from "Shared/Entity/Entity";
import { Network } from "Shared/Network";
import { CollectionManager } from "Shared/Util/CollectionManager";
import { CollectionTag } from "Shared/Util/CollectionTag";
import { Task } from "Shared/Util/Task";
import { ItemShopController } from "../Global/ItemShop/ItemShopController";
import { ProximityPrompt } from "../Global/ProximityPrompt/ProximityPrompt";
import { TeamUpgradeController } from "../Global/TeamUpgrade/TeamUpgradeController";

/** Proximity prompt offset. */
const PROXIMITY_PROMPT_OFFSET = new Vector3(0, 0.2, 0);

@Controller({})
export class ShopkeeperController implements OnStart {
	constructor(
		private readonly teamUpgradeController: TeamUpgradeController,
		private readonly itemShopController: ItemShopController,
	) {}

	OnStart(): void {
		Network.ServerToClient.ItemShop.AddNPCs.Client.OnServerEvent((entityIds) => {
			for (const id of entityIds) {
				Task.Spawn(async () => {
					const entity = await Entity.WaitForId(id);
					if (!entity) {
						warn("Failed to find Item Shop entity: " + id);
						return;
					}
					const prompt = new ProximityPrompt({
						promptPosition: entity.GetMiddlePosition().add(PROXIMITY_PROMPT_OFFSET),
						activationKey: KeyCode.F,
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
			}
		});
		Network.ServerToClient.TeamUpgradeShop.AddNPCs.Client.OnServerEvent((entityIds) => {
			for (const id of entityIds) {
				Task.Spawn(async () => {
					const entity = await Entity.WaitForId(id);
					if (!entity) {
						warn("Failed to find Team Upgrades entity: " + id);
						return;
					}
					const prompt = new ProximityPrompt({
						promptPosition: entity.GetMiddlePosition().add(PROXIMITY_PROMPT_OFFSET),
						activationKey: KeyCode.F,
						activationKeyString: "F",
						activationRange: 3.5,
						bottomText: "Team Upgrades",
						topText: "Open",
					});
					/* Open shop UI on prompt activation. */
					prompt.OnActivated.Connect(() => {
						this.teamUpgradeController.Open();
					});
				});
			}
		});
		/* Listen for shopkeeper creation and create proximity prompts accordingly. */
		CollectionManager.WatchCollectionTag(CollectionTag.ITEM_SHOP_SHOPKEEPER, (gameObject) => {
			print("shop keeper: ", gameObject);
			print("name: " + gameObject.name);
		});
		CollectionManager.WatchCollectionTag(CollectionTag.TEAM_UPGRADES_SHOPKEEPER, (gameObject) => {
			const prompt = new ProximityPrompt({
				promptPosition: gameObject.transform.position.add(PROXIMITY_PROMPT_OFFSET),
				activationKey: KeyCode.F,
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
