/// <reference types="@easy-games/compiler-types" />
import { InventoryController } from "../Client/Controllers/Inventory/InventoryController";
import { InventoryService } from "../Server/Services/Inventory/InventoryService";
import { CharactersSingleton } from "./Character/CharactersSingleton";
import { DamageSingleton } from "./Damage/DamageSingleton";
import { PlayersSingleton } from "./Player/PlayersSingleton";
import { TeamsSingleton } from "./Team/TeamSingleton";
export declare const Airship: {
    players: Omit<PlayersSingleton, "OnStart">;
    characters: Omit<CharactersSingleton, "OnStart">;
    damage: Omit<DamageSingleton, "OnStart">;
    teams: Omit<TeamsSingleton, "OnStart">;
    client: {
        inventory: InventoryController;
    };
    server: {
        inventory: InventoryService;
    };
};
