import { OnStart, Service } from "@easy-games/flamework-core";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { Network } from "Shared/Network";
import { DEFAULT_BEDWARS_SHOP, ShopItem } from "Shared/Shop/ShopMeta";
import { EntityService } from "../Entity/EntityService";

@Service({})
export class ShopService implements OnStart {
	constructor(private readonly entityService: EntityService) {}

	OnStart(): void {
		/* Handle incoming purchase requests. */
		Network.ClientToServer.Shop.PurchaseRequest.Server.SetCallback((clientId, shopItem) => {
			return this.HandleIncomingPurchaseRequest(clientId, shopItem);
		});
	}

	/** Validates and fulfills incoming purchase requests. */
	private HandleIncomingPurchaseRequest(clientId: number, item: ShopItem): boolean {
		/* Validate that entity exists. */
		const requestEntity = this.entityService.GetEntityByClientId(clientId);
		if (!requestEntity) return false;
		/* Valide that entity has an inventory. */
		if (!(requestEntity instanceof CharacterEntity)) return false;
		/* Validate that shop item. */
		const shopItem = DEFAULT_BEDWARS_SHOP.shopItems.find((shopItem) => shopItem.itemType === item.itemType);
		if (!shopItem) return false;
		/* Validate user can afford item. */
		const entityInv = requestEntity.GetInventory();
		const canAfford = entityInv.HasEnough(shopItem.currency, shopItem.price);
		if (!canAfford) return false;
		/* Fulfill purchase. */
		entityInv.Decrement(shopItem.currency, shopItem.price);
		entityInv.AddItem(new ItemStack(shopItem.itemType, shopItem.quantity));
		return true;
	}
}
