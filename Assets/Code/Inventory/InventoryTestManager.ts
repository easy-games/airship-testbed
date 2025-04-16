import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";

export default class InventoryTestManager extends AirshipSingleton {
	override Start(): void {
		Airship.Inventory.RegisterItem("Iron", {
			displayName: "Iron Ingot",
			maxStackSize: undefined,
		});

		if (Game.IsServer()) {
			// example passive iron
			Airship.Players.ObservePlayers((player) => {
				const ironPassiveThread = task.spawn(() => {
					while (task.wait(1.5)) {
						player.character?.inventory.AddItem(new ItemStack("Iron", 1));
					}
				});

				return () => {
					task.cancel(ironPassiveThread);
				};
			});
		}

        // Click to swap
        Airship.Inventory.onInventorySlotClicked.Connect((interaction) => {
			const inventoryUI = Airship.Inventory.ui;
			if (!inventoryUI) return;

			const externalInventory = inventoryUI.GetActiveExternalInventory();
			const localInventory = Airship.Inventory.localInventory;

			if (!localInventory) return;
			if (!externalInventory) {
				Airship.Inventory.QuickMoveSlot(localInventory, interaction.slotIndex);
			} else {
				if (interaction.IsExternalInventory()) {
					Airship.Inventory.MoveToInventory(externalInventory, interaction.slotIndex, localInventory);
				} else if (interaction.IsLocalInventory()) {
					Airship.Inventory.MoveToInventory(localInventory, interaction.slotIndex, externalInventory);
				}
			}
		});
	}

	override OnDestroy(): void {}
}
