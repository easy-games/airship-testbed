import { InventoryController } from "Client/Controllers/Inventory/InventoryController";
import { InventoryService } from "Server/Services/Inventory/InventoryService";
import { CharacterManager } from "./Character/CharacterManager";
import { DamageManager } from "./Damage/DamageManager";
import { PlayerManager } from "./Player/PlayerManager";

export const Airship = {
	Players: undefined as unknown as Omit<PlayerManager, "OnStart">,
	Characters: undefined as unknown as Omit<CharacterManager, "OnStart">,
	Damage: undefined as unknown as Omit<DamageManager, "OnStart">,
	Client: {
		Inventory: undefined as unknown as InventoryController,
	},
	Server: {
		Inventory: undefined as unknown as InventoryService,
	},
};
