import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";

export default class InventoryTestManager extends AirshipSingleton {
	public passiveSpawnIron = true;
	public passiveIronSpawnCooldown = 0.1;

	override Start(): void {
		// Register merge function for TestItemWithCustomData (averages values)
		Airship.Inventory.RegisterCustomDataMergeFunction(
			"TestItemWithCustomData",
			(data1, data2, amount1, amount2) => {
				if (data1.durability && data2.durability) {
					const avgDurability = ((data1.durability as number) + (data2.durability as number)) / 2;
					const avgValue = ((data1.value as number) + (data2.value as number)) / 2;
					return { value: avgValue, durability: avgDurability };
				}
				return undefined;
			},
		);

		// Register merge function for TestItemWithCustomData2 (sums values)
		Airship.Inventory.RegisterCustomDataMergeFunction(
			"TestItemWithCustomData2",
			(data1, data2, amount1, amount2) => {
				if (data1.value && data2.value) {
					const combinedDurability = (data1.durability as number) + (data2.durability as number);
					const combinedValue = (data1.value as number) + (data2.value as number);
					return { value: combinedValue, durability: combinedDurability };
				}
				return undefined;
			},
		);
		Airship.Inventory.RegisterItem("Iron", {
			displayName: "Iron Ingot",
			maxStackSize: undefined,
		});

		Airship.Inventory.RegisterItem("TestItemWithCustomData", {
			displayName: "Test Item",
		});
		Airship.Inventory.RegisterItem("TestItemWithCustomData2", {
			displayName: "Test Item 2",
		});

		if (Game.IsServer()) {
			Airship.Characters.ObserveCharacters((character) => {
				this.TestMergeWithDifferingCustomData();
			});
		}

		if (Game.IsServer()) {
			// example passive iron
			Airship.Players.ObservePlayers((player) => {
				if (this.passiveSpawnIron) {
					const ironPassiveThread = task.spawn(() => {
						while (task.wait(this.passiveIronSpawnCooldown)) {
							player.character?.inventory?.AddItem(new ItemStack("Iron", 1));
						}
					});

					return () => {
						task.cancel(ironPassiveThread);
					};
				}
			});
		}

		Airship.Inventory.onInventoryOpened.Connect((event) => {
			print("inventory was opened", event.inventory.id);
		});
		Airship.Inventory.onInventoryClosed.Connect((event) => {
			print("inventory was closed", event.inventory.id);
		});

		// Click to swap
		// Airship.Inventory.onInventorySlotClicked.Connect((interaction) => {
		// 	const inventoryUI = Airship.Inventory.ui;
		// 	if (!inventoryUI) return;

		// 	const externalInventory = inventoryUI.GetActiveExternalInventory();
		// 	const localInventory = Airship.Inventory.localInventory;

		// 	if (!localInventory) return;
		// 	if (!externalInventory) {
		// 		Airship.Inventory.QuickMoveSlot(
		// 			localInventory,
		// 			interaction.slotIndex,
		// 			Airship.Inventory.ui?.hotbarSlots ?? 0,
		// 		);
		// 	} else {
		// 		if (interaction.IsExternalInventory()) {
		// 			Airship.Inventory.MoveToInventory(externalInventory, interaction.slotIndex, localInventory);
		// 		} else if (interaction.IsLocalInventory()) {
		// 			Airship.Inventory.MoveToInventory(localInventory, interaction.slotIndex, externalInventory);
		// 		}
		// 	}
		// });
	}

	private TestMergeWithDifferingCustomData(): void {
		const players = Airship.Players.GetPlayers();
		const player = players[0];
		const inventory = player.character?.inventory;
		if (!inventory) return;

		const stack1 = new ItemStack("TestItemWithCustomData", 5, {
			value: 100,
			durability: 50,
		});

		const stack2 = new ItemStack("TestItemWithCustomData", 3, {
			value: 200,
			durability: 75,
		});

		const stack3 = new ItemStack("TestItemWithCustomData2", 1, {
			value: 300,
			durability: 150,
		});

		const stack4 = new ItemStack("TestItemWithCustomData2", 1, {
			value: 400,
			durability: 200,
		});

		inventory.AddItem(stack1);
		const merged1 = inventory.AddItem(stack2);
		print(`[InventoryTestManager] Added stack1 & 2, merge result: ${merged1}`);

		inventory.AddItem(stack3);
		const merged2 = inventory.AddItem(stack4);
		print(`[InventoryTestManager] Added stack3 & 4, merge result: ${merged2}`);

		let mergedItem1: ItemStack | undefined = undefined;
		for (let i = 0; i < inventory.GetMaxSlots(); i++) {
			const item = inventory.GetItem(i);
			if (item && item.itemType === "TestItemWithCustomData") {
				mergedItem1 = item;
				break;
			}
		}

		if (!mergedItem1) {
			warn("[InventoryTestManager] No merged stack found for TestItemWithCustomData");
		} else {
			const customData1 = mergedItem1.customData as { value?: number; durability?: number };
			print(
				`[InventoryTestManager] Stack1/2 merge: ${mergedItem1.amount} items, durability=${customData1?.durability}, value=${customData1?.value}`,
			);
		}

		let mergedItem2: ItemStack | undefined = undefined;
		for (let i = 0; i < inventory.GetMaxSlots(); i++) {
			const item = inventory.GetItem(i);
			if (item && item.itemType === "TestItemWithCustomData2") {
				mergedItem2 = item;
				break;
			}
		}

		if (!mergedItem2) {
			warn("[InventoryTestManager] No merged stack found for TestItemWithCustomData2");
		} else {
			const customData2 = mergedItem2.customData as { value?: number; durability?: number };
			print(
				`[InventoryTestManager] Stack3/4 merge: ${mergedItem2.amount} items, durability=${customData2?.durability}, value=${customData2?.value}`,
			);
		}
	}

	override OnDestroy(): void {}
}
