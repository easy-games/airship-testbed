import { InventoryController } from "Client/Controllers/Inventory/InventoryController";
import { InventoryService } from "Server/Services/Inventory/InventoryService";
import { CharactersSingleton } from "./Character/CharactersSingleton";
import { DamageSingleton } from "./Damage/DamageSingleton";
import { PlayersSingleton } from "./Player/PlayersSingleton";
import { TeamsSingleton } from "./Team/TeamSingleton";

export const Airship = {
	players: undefined as unknown as Omit<PlayersSingleton, "OnStart">,
	characters: undefined as unknown as Omit<CharactersSingleton, "OnStart">,
	damage: undefined as unknown as Omit<DamageSingleton, "OnStart">,
	teams: undefined as unknown as Omit<TeamsSingleton, "OnStart">,
	client: {
		inventory: undefined as unknown as InventoryController,
	},
	server: {
		inventory: undefined as unknown as InventoryService,
	},
};
