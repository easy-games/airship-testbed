/// <reference types="@easy-games/compiler-types" />
import { InventoryController } from "../Client/Controllers/Inventory/InventoryController";
import { InventoryService } from "../Server/Services/Inventory/InventoryService";
import { CharacterManager } from "./Character/CharacterManager";
import { DamageManager } from "./Damage/DamageManager";
import { PlayerManager } from "./Player/PlayerManager";
import { TeamManager } from "./Team/TeamManager";
export declare const Airship: {
    players: Omit<PlayerManager, "OnStart">;
    characters: Omit<CharacterManager, "OnStart">;
    damage: Omit<DamageManager, "OnStart">;
    teams: Omit<TeamManager, "OnStart">;
    client: {
        inventory: InventoryController;
    };
    server: {
        inventory: InventoryService;
    };
};
