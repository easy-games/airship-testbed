import { InventoryController } from "Client/Controllers/Inventory/InventoryController";
import { InventoryService } from "Server/Services/Inventory/InventoryService";

export const Airship = {
	Client: {
		Inventory: undefined as unknown as InventoryController,
	},
	Server: {
		Inventory: undefined as unknown as InventoryService,
	},
};
