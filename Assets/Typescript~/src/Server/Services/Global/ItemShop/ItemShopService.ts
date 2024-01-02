import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { ItemShopMeta } from "Shared/ItemShop/ItemShopMeta";
import { Network } from "Shared/Network";

@Service({})
export class ShopService implements OnStart {
	private swords: ItemType[] = [
		ItemType.WOOD_SWORD,
		ItemType.STONE_SWORD,
		ItemType.IRON_SWORD,
		ItemType.DIAMOND_SWORD,
	];
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
		CoreServerSignals.PlayerJoin.Connect((event) => {
			if (!this.purchasedItems.has(event.player.userId)) {
				this.purchasedItems.set(event.player.userId, new Set<ItemType>());
			}
		});

		CoreServerSignals.BeforeEntityDropItem.Connect((event) => {
			const itemType = event.itemStack.GetItemType();
			const itemMeta = event.itemStack.GetMeta();
			if (
				this.pickaxes.includes(itemType) ||
				this.bows.includes(itemType) ||
				this.swords.includes(itemType) ||
				this.axes.includes(itemType) ||
				itemMeta.armor
			) {
				event.SetCancelled(true);
			}
		});

		CoreServerSignals.EntitySpawn.Connect((event) => {
			if (!event.entity.Player) return;
			if (event.entity.Player.IsBot()) return;
			const purchases = this.purchasedItems.get(event.entity.Player.userId);
			if (!purchases) return;

			if (!(event.entity instanceof CharacterEntity)) return;
			const inv = event.entity.GetInventory();

			let receivedPickaxe = false;
			let receivedSword = false;
			let finalAddedItems: ItemStack[] = [];
			for (const purchasedItem of purchases) {
				const shopItem = ItemShopMeta.GetShopElementFromItemType(purchasedItem);
				if (!shopItem) continue;

				if (shopItem.spawnWithItems) {
					if (shopItem.nextTier && purchases.has(shopItem.nextTier)) {
						continue;
					}
					let itemsToAdd = shopItem.spawnWithItems;
					for (let itemType of itemsToAdd) {
						const itemMeta = ItemUtil.GetItemDef(itemType);
						if (itemMeta.armor) {
							inv.SetItem(inv.ArmorSlots[itemMeta.armor?.armorType], new ItemStack(itemType, 1));
						} else {
							finalAddedItems.push(new ItemStack(itemType, 1));
							if (this.pickaxes.includes(itemType)) {
								receivedPickaxe = true;
							} else if (this.swords.includes(itemType)) {
								receivedSword = true;
							}
						}
					}
				}
			}

			if (!receivedSword) {
				inv.AddItem(new ItemStack(ItemType.WOOD_SWORD, 1));
			}
			if (!receivedPickaxe) {
				inv.AddItem(new ItemStack(ItemType.WOOD_PICKAXE, 1));
			}
			for (const itemStack of finalAddedItems) {
				inv.AddItem(itemStack);
			}

			// debug
			if (RunUtil.IsEditor()) {
				inv.AddItem(new ItemStack(ItemType.WOOD_BOW));
				inv.AddItem(new ItemStack(ItemType.WOOD_ARROW, 100));
			}
		});

		/* Handle incoming purchase requests. */
		Network.ClientToServer.ItemShop.PurchaseRequest.Server.SetCallback((clientId, purchaseItemType) => {
			const shopElement = ItemShopMeta.GetShopElementFromItemType(purchaseItemType);
			if (!shopElement) return false;

			/* Validate that entity exists. */
			const requestEntity = this.entityService.GetEntityByClientId(clientId);
			if (!requestEntity) return false;

			if (!(requestEntity instanceof CharacterEntity)) return false;

			const inv = requestEntity.GetInventory();
			const canAfford = inv.HasEnough(shopElement.currency, shopElement.price);
			if (!canAfford) return false;

			const player = Player.FindByClientId(clientId);
			if (!player) return false;
			inv.Decrement(shopElement.currency, shopElement.price);

			// Give item
			let itemsToAdd = shopElement.spawnWithItems ?? [shopElement.itemType];
			for (let itemTypeToAdd of itemsToAdd) {
				const itemMeta = ItemUtil.GetItemDef(itemTypeToAdd);
				if (itemMeta.armor) {
					inv.SetItem(inv.ArmorSlots[itemMeta.armor?.armorType], new ItemStack(itemTypeToAdd, 1));
				} else {
					let given = false;

					let itemStack = new ItemStack(itemTypeToAdd, shopElement.quantity);

					const TryReplaceSlot = (filter: (itemStack: ItemStack) => boolean): boolean => {
						for (let i = 0; i < inv.GetMaxSlots(); i++) {
							const item = inv.GetItem(i);
							if (item && filter(item)) {
								inv.SetItem(i, itemStack);
								given = true;
								return true;
							}
						}
						return false;
					};

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
						TryReplaceSlot((itemStack) => itemStack.GetMeta().melee !== undefined);
					}
					if (!given && shopElement.replaceBow) {
						TryReplaceSlot((i) => this.bows.includes(i.GetItemType()));
					}
					if (!given && shopElement.replacePickaxe) {
						TryReplaceSlot((itemStack) => this.pickaxes.includes(itemStack.GetItemType()));
					}
					if (!given && shopElement.replaceAxe) {
						TryReplaceSlot((itemStack) => this.axes.includes(itemStack.GetItemType()));
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

					// Extra items
					if (itemTypeToAdd === ItemType.WOOD_BOW) {
						inv.AddItem(new ItemStack(ItemType.WOOD_ARROW, 8));
					}
				}
			}

			const purchases = this.purchasedItems.get(player.userId);
			purchases?.add(shopElement.itemType);

			Network.ServerToClient.ItemShop.ItemPurchased.Server.FireAllClients(
				// clientId,
				player.Character!.Id,
				shopElement.itemType,
			);

			return true;
		});

		CoreServerSignals.EntityDeath.Connect((event) => {
			if (event.entity.Player) {
				const purchases = this.purchasedItems.get(event.entity.Player.userId);
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
						event.entity.Player.clientId,
						toRemove,
					);
				}
			}
		});
	}
}
