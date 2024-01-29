/// <reference types="@easy-games/compiler-types" />
import { CharactersSingleton } from "./Character/CharactersSingleton";
import { DamageSingleton } from "./Damage/DamageSingleton";
import { InventorySingleton } from "./Inventory/InventorySingleton";
import { LoadingScreenSingleton } from "./LoadingScreen/LoadingScreenSingleton";
import { PlayersSingleton } from "./Player/PlayersSingleton";
import { TeamsSingleton } from "./Team/TeamSingleton";
export declare const Airship: {
    players: Omit<PlayersSingleton, "OnStart">;
    characters: Omit<CharactersSingleton, "OnStart">;
    damage: Omit<DamageSingleton, "OnStart">;
    teams: Omit<TeamsSingleton, "OnStart">;
    inventory: Omit<InventorySingleton, "OnStart">;
    loadingScreen: Omit<LoadingScreenSingleton, "OnStart">;
};
