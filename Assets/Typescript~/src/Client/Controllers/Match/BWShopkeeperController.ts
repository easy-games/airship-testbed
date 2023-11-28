import { ProximityPrompt } from "@Easy/Core/Client/Controllers/ProximityPrompt/ProximityPrompt";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { Task } from "@Easy/Core/Shared/Util/Task";
import { Controller, OnStart } from "@easy-games/flamework-core";
import { Network } from "Shared/Network";
import { ItemShopController } from "../Global/ItemShop/ItemShopController";
import { TeamUpgradeController } from "../Global/TeamUpgrade/TeamUpgradeController";

/** Proximity prompt offset. */
const PROXIMITY_PROMPT_OFFSET = new Vector3(0, -0.2, 0);

@Controller({})
export class BWShopkeeperController implements OnStart {
	private itemShopAccessoryCollection = AssetBridge.Instance.LoadAsset<AccessoryCollection>(
		"@Easy/Core/Shared/Resources/Accessories/Collections/ItemShopKeeper/ItemShopKeeperCollection.asset",
	);
	private teamUpgradesAccessoryCollection = this.itemShopAccessoryCollection;

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
						promptPosition: entity.GetHeadPosition().add(PROXIMITY_PROMPT_OFFSET),
						activationKey: KeyCode.F,
						activationKeyString: "F",
						activationRange: 3.5,
						bottomText: "Item Shop",
						topText: "Open",
					});
					// Open shop UI on prompt activation.
					prompt.OnActivated.Connect(() => {
						this.itemShopController.Open();
					});
					// Clothing
					entity.accessoryBuilder.EquipAccessoryCollection(this.itemShopAccessoryCollection, true);
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
						promptPosition: entity.GetHeadPosition().add(PROXIMITY_PROMPT_OFFSET),
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

					// Clothing
					entity.accessoryBuilder.EquipAccessoryCollection(this.itemShopAccessoryCollection, true);
				});
			}
		});
	}
}
