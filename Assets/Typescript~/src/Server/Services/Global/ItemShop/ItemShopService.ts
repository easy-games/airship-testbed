import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { ItemShopMeta } from "Shared/ItemShop/ItemShopMeta";
import { Network } from "Shared/Network";
import { Player } from "Shared/Player/Player";
import { Theme } from "Shared/Util/Theme";
import { EntityService } from "../Entity/EntityService";

@Service({})
export class ShopService implements OnStart {
	private bows: ItemType[] = [ItemType.WOOD_BOW];
	private pickaxes: ItemType[] = [
		ItemType.WOOD_PICKAXE,
		ItemType.STONE_PICKAXE,
		ItemType.IRON_PICKAXE,
		ItemType.DIAMOND_PICKAXE,
	];
	private axes: ItemType[] = [];
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
					for (let itemType of itemsToAdd) {
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
		Network.ClientToServer.ItemShop.PurchaseRequest.Server.SetCallback((clientId, purchaseItemType) => {
			print("purchase.1");
			const shopElement = ItemShopMeta.GetShopElementFromItemType(purchaseItemType);
			if (!shopElement) return false;

			print("purchase.2");
			/* Validate that entity exists. */
			const requestEntity = this.entityService.GetEntityByClientId(clientId);
			if (!requestEntity) return false;

			print("purchase.3");
			if (!(requestEntity instanceof CharacterEntity)) return false;

			print("purchase.4");
			const inv = requestEntity.GetInventory();
			const canAfford = inv.HasEnough(shopElement.currency, shopElement.price);
			if (!canAfford) return false;

			print("purchase.5");
			const player = Player.FindByClientId(clientId);
			if (!player) return false;
			inv.Decrement(shopElement.currency, shopElement.price);

			print("purchase.6");
			// Give item
			let itemsToAdd = shopElement.spawnWithItems ?? [shopElement.itemType];
			for (let itemTypeToAdd of itemsToAdd) {
				const itemMeta = ItemUtil.GetItemMeta(itemTypeToAdd);
				if (itemMeta.Armor) {
					inv.SetItem(inv.armorSlots[itemMeta.Armor.ArmorType], new ItemStack(itemTypeToAdd, 1));
				} else {
					let given = false;
					for (let i = 0; i < inv.GetMaxSlots(); i++) {
						const existingItemStack = inv.GetItem(i);
						if (!existingItemStack) continue;
						const existingShopElement = ItemShopMeta.GetShopElementFromItemType(
							existingItemStack.GetItemType(),
						);
						if (
							existingShopElement?.nextTier === itemTypeToAdd ||
							(shopElement?.itemType === ItemType.STONE_PICKAXE &&
								existingItemStack.GetItemType() === ItemType.WOOD_PICKAXE)
						) {
							inv.SetItem(i, new ItemStack(itemTypeToAdd, shopElement.quantity));
							given = true;
							break;
						}
					}
					if (!given && shopElement.replaceMelee) {
						for (let i = 0; i < inv.GetMaxSlots(); i++) {
							const item = inv.GetItem(i);
							if (item?.GetMeta().melee) {
								inv.SetItem(i, new ItemStack(itemTypeToAdd, shopElement.quantity));
								given = true;
								break;
							}
						}
					}
					if (!given && shopElement.replaceBow) {
						for (let i = 0; i < inv.GetMaxSlots(); i++) {
							const item = inv.GetItem(i);
							if (item && this.bows.includes(item.GetItemType())) {
								inv.SetItem(i, new ItemStack(itemTypeToAdd, shopElement.quantity));
								given = true;
								break;
							}
						}
					}
					if (!given && shopElement.replacePickaxe) {
						for (let i = 0; i < inv.GetMaxSlots(); i++) {
							const item = inv.GetItem(i);
							if (item && this.pickaxes.includes(item.GetItemType())) {
								inv.SetItem(i, new ItemStack(itemTypeToAdd, shopElement.quantity));
								given = true;
								break;
							}
						}
					}
					if (!given && shopElement.replaceAxe) {
						for (let i = 0; i < inv.GetMaxSlots(); i++) {
							const item = inv.GetItem(i);
							if (item && this.axes.includes(item.GetItemType())) {
								inv.SetItem(i, new ItemStack(itemTypeToAdd, shopElement.quantity));
								given = true;
								break;
							}
						}
					}
					if (!given) {
						if (itemTypeToAdd === ItemType.WHITE_WOOL) {
							const team = player.GetTeam();
							if (team) {
								switch (team.color) {
									case Theme.TeamColor.Blue:
										itemTypeToAdd = ItemType.BLUE_WOOL;
										break;
									case Theme.TeamColor.Red:
										itemTypeToAdd = ItemType.RED_WOOL;
										break;
									case Theme.TeamColor.Yellow:
										itemTypeToAdd = ItemType.YELLOW_WOOL;
										break;
									case Theme.TeamColor.Green:
										itemTypeToAdd = ItemType.GREEN_WOOL;
										break;
								}
							}
						}
						inv.AddItem(new ItemStack(itemTypeToAdd, shopElement.quantity));
					}
				}
			}

			const purchases = this.purchasedItems.get(player.userId);
			purchases?.add(shopElement.itemType);

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
