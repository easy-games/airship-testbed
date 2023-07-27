import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { ItemShopMeta } from "Shared/ItemShop/ItemShopMeta";
import { Network } from "Shared/Network";
import { Player } from "Shared/Player/Player";
import { EntityService } from "../Entity/EntityService";

@Service({})
export class ShopService implements OnStart {
	private purchasedItems = new Map<string, Set<ItemType>>();

	constructor(private readonly entityService: EntityService) {}

	OnStart(): void {
		ServerSignals.PlayerJoin.Connect((event) => {
			if (!this.purchasedItems.has(event.player.userId)) {
				this.purchasedItems.set(event.player.userId, new Set<ItemType>());
			}
		});

		ServerSignals.EntitySpawn.Connect((event) => {
			if (!event.Entity.player) return;
			const purchases = this.purchasedItems.get(event.Entity.player.userId);
			if (!purchases) return;

			if (!(event.Entity instanceof CharacterEntity)) return;
			const inv = event.Entity.GetInventory();

			for (const purchasedItem of purchases) {
				const shopItem = ItemShopMeta.GetShopElementFromItemType(purchasedItem);
				if (!shopItem) continue;

				if (shopItem.spawnWithItems) {
					if (shopItem.nextTier && purchases.has(shopItem.nextTier)) {
						continue;
					}
					let itemsToAdd = shopItem.spawnWithItems || [shopItem.itemType];
					for (const itemType of itemsToAdd) {
						const itemMeta = ItemUtil.GetItemMeta(itemType);
						if (itemMeta.Armor) {
							inv.SetItem(inv.armorSlots[itemMeta.Armor.ArmorType], new ItemStack(itemType, 1));
						} else {
							inv.AddItem(new ItemStack(itemType, 1));
						}
					}
				}
			}
		});

		/* Handle incoming purchase requests. */
		Network.ClientToServer.ItemShop.PurchaseRequest.Server.SetCallback((clientId, itemType) => {
			const shopItem = ItemShopMeta.GetShopElementFromItemType(itemType);
			if (!shopItem) return false;

			/* Validate that entity exists. */
			const requestEntity = this.entityService.GetEntityByClientId(clientId);
			if (!requestEntity) return false;

			if (!(requestEntity instanceof CharacterEntity)) return false;

			const inv = requestEntity.GetInventory();
			const canAfford = inv.HasEnough(shopItem.currency, shopItem.price);
			if (!canAfford) return false;

			inv.Decrement(shopItem.currency, shopItem.price);

			const itemMeta = ItemUtil.GetItemMeta(itemType);
			if (itemMeta.Armor) {
				inv.SetItem(inv.armorSlots[itemMeta.Armor.ArmorType], new ItemStack(shopItem.itemType, 1));
			} else {
				inv.AddItem(new ItemStack(shopItem.itemType, shopItem.quantity));
			}

			const player = Player.FindByClientId(clientId);
			if (player) {
				const purchases = this.purchasedItems.get(player.userId);
				purchases?.add(shopItem.itemType);
			}

			return true;
		});

		ServerSignals.EntityDeath.Connect((event) => {
			if (event.entity.player) {
				const purchases = this.purchasedItems.get(event.entity.player.userId);
				if (purchases) {
					const toRemove: ItemType[] = [];
					for (const itemType of purchases) {
						const shopItem = ItemShopMeta.GetShopElementFromItemType(itemType);
						if (shopItem?.removeTierOnDeath) {
							toRemove.push(shopItem.itemType);
						}
					}
					for (const itemType of toRemove) {
						purchases.delete(itemType);
					}
					Network.ServerToClient.ItemShop.RemoveTierPurchases.Server.FireClient(
						event.entity.player.clientId,
						toRemove,
					);
				}
			}
		});
	}
}
