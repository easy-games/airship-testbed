import { InventoryController } from "Client/Controllers/Inventory/InventoryController";
import { InventoryService } from "Server/Services/Inventory/InventoryService";
import { CharacterManager } from "./Character/CharacterManager";
import { DamageManager } from "./Damage/DamageManager";
import { PlayerManager } from "./Player/PlayerManager";
import { TeamManager } from "./Team/TeamManager";

export const Airship = {
	players: undefined as unknown as Omit<PlayerManager, "OnStart">,
	characters: undefined as unknown as Omit<CharacterManager, "OnStart">,
	damage: undefined as unknown as Omit<DamageManager, "OnStart">,
	teams: undefined as unknown as Omit<TeamManager, "OnStart">,
	client: {
		inventory: undefined as unknown as InventoryController,
	},
	server: {
		inventory: undefined as unknown as InventoryService,
	},
};
