/// <reference types="@easy-games/compiler-types" />
import { PlatformInventoryService } from "../Server/Airship/PlatformInventory/PlatformInventoryService";
import { CharactersSingleton } from "./Character/CharactersSingleton";
import { DamageSingleton } from "./Damage/DamageSingleton";
import { InventorySingleton } from "./Inventory/InventorySingleton";
import { LoadingScreenSingleton } from "./LoadingScreen/LoadingScreenSingleton";
import { PlayersSingleton } from "./Player/PlayersSingleton";
import { TeamsSingleton } from "./Team/TeamSingleton";
import { CacheStoreService } from "../Server/Airship/CacheStore/CacheStoreService";
import { DataStoreService } from "../Server/Airship/DataStore/DataStoreService";
import { LeaderboardService } from "../Server/Airship/Leaderboard/LeaderboardService";
import { MatchmakingService } from "../Server/Airship/Matchmaking/MatchmakingService";
import { PartyService } from "../Server/Airship/Party/PartyService";
import { TransferService } from "../Server/Airship/Transfer/TransferService";
import { UserService } from "../Server/Airship/User/UserService";
import { FriendsController } from "../Client/Airship/Friends/FriendsController";
import { MatchmakingController } from "../Client/Airship/Matchmaking/MatchmakingController";
import { PartyController } from "../Client/Airship/Party/PartyController";
import { PlatformInventoryController } from "../Client/Airship/PlatformInventory/PlatformInventoryController";
import { TransferController } from "../Client/Airship/Transfer/TransferController";
import { UserController } from "../Client/Airship/User/UserController";
export declare const Platform: {
    server: {
        cacheStore: Omit<CacheStoreService, "OnStart">;
        dataStore: Omit<DataStoreService, "OnStart">;
        leaderboard: Omit<LeaderboardService, "OnStart">;
        matchmaking: Omit<MatchmakingService, "OnStart">;
        party: Omit<PartyService, "OnStart">;
        transfer: Omit<TransferService, "OnStart">;
        user: Omit<UserService, "OnStart">;
        inventory: Omit<PlatformInventoryService, "OnStart">;
    };
    client: {
        friends: Omit<FriendsController, "OnStart">;
        matchmaking: Omit<MatchmakingController, "OnStart">;
        party: Omit<PartyController, "OnStart">;
        inventory: Omit<PlatformInventoryController, "OnStart">;
        transfer: Omit<TransferController, "OnStart">;
        user: Omit<UserController, "OnStart">;
    };
};
export declare const Airship: {
    players: Omit<PlayersSingleton, "OnStart">;
    characters: Omit<CharactersSingleton, "OnStart">;
    damage: Omit<DamageSingleton, "OnStart">;
    teams: Omit<TeamsSingleton, "OnStart">;
    inventory: Omit<InventorySingleton, "OnStart">;
    loadingScreen: Omit<LoadingScreenSingleton, "OnStart">;
};
